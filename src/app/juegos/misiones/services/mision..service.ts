// services/mision.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { Mision, EstadoMision, ProgresoMision } from '../models/mision.model';
import { MISIONES_MOCK } from '../data/misiones-mock.data';

@Injectable({ providedIn: 'root' })
export class MisionService {
    private misionesSubject = new BehaviorSubject<Mision[]>(MISIONES_MOCK);
    public misiones$ = this.misionesSubject.asObservable();

    private misionActualSubject = new BehaviorSubject<Mision | null>(null);
    public misionActual$ = this.misionActualSubject.asObservable();

    private progresoActualSubject = new BehaviorSubject<ProgresoMision | null>(null);
    public progresoActual$ = this.progresoActualSubject.asObservable();

    constructor() {
        this.inicializarEstados();
    }

    private inicializarEstados(): void {
        // Cargar progreso desde localStorage si existe
        const progresoGuardado = localStorage.getItem('misiones_progreso');
        if (progresoGuardado) {
            const progresos = JSON.parse(progresoGuardado);
            const misiones = this.misionesSubject.value;

            misiones.forEach(mision => {
                const progreso = progresos[mision.id];
                if (progreso) {
                    mision.estado = progreso.estado;
                    mision.progreso = progreso.progreso;
                }
            });

            this.misionesSubject.next([...misiones]);
        }
    }

    obtenerMisiones(): Observable<Mision[]> {
        return this.misiones$;
    }

    obtenerMisionesPorEstado(estado: EstadoMision): Observable<Mision[]> {
        return new Observable(observer => {
            const misiones = this.misionesSubject.value.filter(m => m.estado === estado);
            observer.next(misiones);
            observer.complete();
        });
    }

    obtenerMisionPorId(id: string): Observable<Mision | undefined> {
        const mision = this.misionesSubject.value.find(m => m.id === id);
        return of(mision);
    }

    iniciarMision(misionId: string, usuarioId: number = 1): Observable<ProgresoMision> {
        const misiones = this.misionesSubject.value;
        const mision = misiones.find(m => m.id === misionId);

        if (!mision) {
            throw new Error('Misión no encontrada');
        }

        if (mision.estado === EstadoMision.BLOQUEADA) {
            throw new Error('Misión bloqueada - completa los requisitos primero');
        }

        // Crear progreso inicial
        const progreso: ProgresoMision = {
            usuarioId,
            misionId,
            faseActual: 0,
            intentos: 0,
            respuestasCorrectas: 0,
            respuestasIncorrectas: 0,
            pistasUsadas: 0,
            fechaInicio: new Date(),
            tiempoTranscurrido: 0,
            puntuacion: 0
        };

        // Actualizar estado de la misión
        mision.estado = EstadoMision.EN_PROGRESO;
        mision.progreso = progreso;

        this.misionesSubject.next([...misiones]);
        this.misionActualSubject.next(mision);
        this.progresoActualSubject.next(progreso);

        this.guardarProgreso();

        return of(progreso).pipe(delay(500));
    }

    avanzarFase(misionId: string): Observable<boolean> {
        const misiones = this.misionesSubject.value;
        const mision = misiones.find(m => m.id === misionId);

        if (!mision || !mision.progreso) {
            return of(false);
        }

        mision.progreso.faseActual++;

        // Si completó todas las fases
        if (mision.progreso.faseActual >= mision.fases.length) {
            return this.completarMision(misionId);
        }

        this.misionesSubject.next([...misiones]);
        this.progresoActualSubject.next(mision.progreso);
        this.guardarProgreso();

        return of(true).pipe(delay(300));
    }

    registrarRespuesta(misionId: string, correcta: boolean): Observable<void> {
        const misiones = this.misionesSubject.value;
        const mision = misiones.find(m => m.id === misionId);

        if (!mision || !mision.progreso) {
            return of(void 0);
        }

        mision.progreso.intentos++;
        if (correcta) {
            mision.progreso.respuestasCorrectas++;
            mision.progreso.puntuacion += this.calcularPuntosPorRespuesta(mision.dificultad);
        } else {
            mision.progreso.respuestasIncorrectas++;
        }

        this.misionesSubject.next([...misiones]);
        this.progresoActualSubject.next(mision.progreso);
        this.guardarProgreso();

        return of(void 0).pipe(delay(200));
    }

    usarPista(misionId: string): Observable<void> {
        const misiones = this.misionesSubject.value;
        const mision = misiones.find(m => m.id === misionId);

        if (!mision || !mision.progreso) {
            return of(void 0);
        }

        mision.progreso.pistasUsadas++;
        mision.progreso.puntuacion -= 10; // Penalización por usar pista

        this.misionesSubject.next([...misiones]);
        this.progresoActualSubject.next(mision.progreso);
        this.guardarProgreso();

        return of(void 0).pipe(delay(100));
    }

    completarMision(misionId: string): Observable<boolean> {
        const misiones = this.misionesSubject.value;
        const mision = misiones.find(m => m.id === misionId);

        if (!mision || !mision.progreso) {
            return of(false);
        }

        // Calcular puntuación final
        const bonusTiempo = this.calcularBonusTiempo(
            mision.progreso.tiempoTranscurrido,
            mision.tiempoEstimado
        );
        const bonusPrecision = this.calcularBonusPrecision(
            mision.progreso.respuestasCorrectas,
            mision.progreso.intentos
        );

        mision.progreso.puntuacion += bonusTiempo + bonusPrecision;
        mision.estado = EstadoMision.COMPLETADA;

        // Desbloquear misiones dependientes
        this.desbloquearMisionesDependientes(misionId);

        this.misionesSubject.next([...misiones]);
        this.guardarProgreso();

        return of(true).pipe(delay(500));
    }

    abandonarMision(misionId: string): Observable<void> {
        const misiones = this.misionesSubject.value;
        const mision = misiones.find(m => m.id === misionId);

        if (!mision) {
            return of(void 0);
        }

        mision.estado = EstadoMision.DISPONIBLE;
        mision.progreso = undefined;

        this.misionActualSubject.next(null);
        this.progresoActualSubject.next(null);
        this.misionesSubject.next([...misiones]);
        this.guardarProgreso();

        return of(void 0).pipe(delay(200));
    }

    private desbloquearMisionesDependientes(misionCompletadaId: string): void {
        const misiones = this.misionesSubject.value;
        const misionCompletada = misiones.find(m => m.id === misionCompletadaId);

        if (!misionCompletada) return;

        // Desbloquear misiones que tenían esta como requisito
        misiones.forEach(mision => {
            if (mision.estado === EstadoMision.BLOQUEADA) {
                const requisitos = mision.requisitos;

                // Verificar si esta misión era requisito
                if (requisitos.misionesPrevias?.includes(misionCompletadaId)) {
                    // Verificar si todos los requisitos se cumplen
                    const todosRequisitos = requisitos.misionesPrevias.every(reqId => {
                        const reqMision = misiones.find(m => m.id === reqId);
                        return reqMision?.estado === EstadoMision.COMPLETADA;
                    });

                    if (todosRequisitos) {
                        mision.estado = EstadoMision.DISPONIBLE;
                    }
                }
            }
        });

        this.misionesSubject.next([...misiones]);
    }

    private calcularPuntosPorRespuesta(dificultad: string): number {
        const puntos = {
            'FACIL': 50,
            'MEDIO': 100,
            'DIFICIL': 150,
            'EXPERTO': 200
        };
        return puntos[dificultad as keyof typeof puntos] || 50;
    }

    private calcularBonusTiempo(tiempoReal: number, tiempoEstimado: number): number {
        const tiempoRealMinutos = tiempoReal / 60;
        if (tiempoRealMinutos <= tiempoEstimado * 0.8) {
            return 100; // Bonus por rapidez
        } else if (tiempoRealMinutos <= tiempoEstimado) {
            return 50;
        }
        return 0;
    }

    private calcularBonusPrecision(correctas: number, intentos: number): number {
        if (intentos === 0) return 0;
        const precision = (correctas / intentos) * 100;

        if (precision === 100) return 200; // Perfecto
        if (precision >= 80) return 100;
        if (precision >= 60) return 50;
        return 0;
    }

    private guardarProgreso(): void {
        const misiones = this.misionesSubject.value;
        const progresos: any = {};

        misiones.forEach(mision => {
            if (mision.estado !== EstadoMision.DISPONIBLE || mision.progreso) {
                progresos[mision.id] = {
                    estado: mision.estado,
                    progreso: mision.progreso
                };
            }
        });

        localStorage.setItem('misiones_progreso', JSON.stringify(progresos));
    }

    // Método para obtener estadísticas
    obtenerEstadisticas(): Observable<any> {
        const misiones = this.misionesSubject.value;

        const stats = {
            total: misiones.length,
            completadas: misiones.filter(m => m.estado === EstadoMision.COMPLETADA).length,
            enProgreso: misiones.filter(m => m.estado === EstadoMision.EN_PROGRESO).length,
            disponibles: misiones.filter(m => m.estado === EstadoMision.DISPONIBLE).length,
            bloqueadas: misiones.filter(m => m.estado === EstadoMision.BLOQUEADA).length,
            porcentajeCompletado: 0,
            insigniasObtenidas: 0
        };

        stats.porcentajeCompletado = (stats.completadas / stats.total) * 100;

        // Contar insignias
        misiones.forEach(mision => {
            if (mision.estado === EstadoMision.COMPLETADA) {
                stats.insigniasObtenidas += mision.recompensas.insignias.length;
            }
        });

        return of(stats);
    }
}
