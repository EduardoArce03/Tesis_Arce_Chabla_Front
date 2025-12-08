import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
    PuntoInteres,
    ProgresoExploracion,
    NarrativaGenerada,
    NivelDescubrimiento,
    CategoriaPunto
} from '@/models/exploracion.model';

@Injectable({ providedIn: 'root' })
export class ExploracionService {
    private apiUrl = '/api/ingapirca'; // Ajusta según tu backend

    private progresoSubject = new BehaviorSubject<ProgresoExploracion | null>(null);
    public progreso$ = this.progresoSubject.asObservable();

    private puntoSeleccionadoSubject = new BehaviorSubject<PuntoInteres | null>(null);
    public puntoSeleccionado$ = this.puntoSeleccionadoSubject.asObservable();

    constructor(private http: HttpClient) {}

    obtenerPuntosInteres(): Observable<PuntoInteres[]> {
        // Por ahora datos mock, luego conectas al backend
        return new Observable(observer => {
            observer.next(this.getMockPuntos());
            observer.complete();
        });
    }

    obtenerProgreso(usuarioId: number): Observable<ProgresoExploracion> {
        return this.http.get<ProgresoExploracion>(`${this.apiUrl}/progreso/${usuarioId}`)
            .pipe(tap(progreso => this.progresoSubject.next(progreso)));
    }

    visitarPunto(usuarioId: number, puntoId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/visitar`, { usuarioId, puntoId });
    }

    generarNarrativa(puntoId: number, nivel: string): Observable<NarrativaGenerada> {
        // Mock por ahora
        return new Observable(observer => {
            setTimeout(() => {
                observer.next(this.getMockNarrativa(puntoId, nivel));
                observer.complete();
            }, 1500); // Simula latencia de IA
        });
    }

    seleccionarPunto(punto: PuntoInteres | null): void {
        this.puntoSeleccionadoSubject.next(punto);
    }

    // DATOS MOCK para testing
    private getMockPuntos(): PuntoInteres[] {
        return [
            {
                id: 1,
                nombre: 'Templo del Sol',
                nombreKichwa: 'Inti Wasi',
                coordenadas: { x: 50, y: 40 },
                imagenUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
                categoria: CategoriaPunto.TEMPLO,
                desbloqueado: true,
                visitado: false,
                nivelDescubrimiento: NivelDescubrimiento.NO_VISITADO,
                descripcionCorta: 'Principal estructura ceremonial del complejo'
            },
            {
                id: 2,
                nombre: 'Plaza Ceremonial',
                nombreKichwa: 'Inti Pampa',
                coordenadas: { x: 35, y: 55 },
                imagenUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                categoria: CategoriaPunto.PLAZA,
                desbloqueado: true,
                visitado: false,
                nivelDescubrimiento: NivelDescubrimiento.NO_VISITADO,
                descripcionCorta: 'Espacio para ceremonias y rituales comunitarios'
            },
            {
                id: 3,
                nombre: 'Acllahuasi',
                nombreKichwa: 'Akllakunapa Wasin',
                coordenadas: { x: 65, y: 50 },
                imagenUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                categoria: CategoriaPunto.VIVIENDA,
                desbloqueado: false,
                visitado: false,
                nivelDescubrimiento: NivelDescubrimiento.NO_VISITADO,
                descripcionCorta: 'Casa de las escogidas del Sol',
                requisitos: [1] // Debes visitar el Templo primero
            },
            {
                id: 4,
                nombre: 'Qolqa (Depósitos)',
                nombreKichwa: 'Qolqa',
                coordenadas: { x: 30, y: 35 },
                imagenUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
                categoria: CategoriaPunto.DEPOSITO,
                desbloqueado: true,
                visitado: false,
                nivelDescubrimiento: NivelDescubrimiento.NO_VISITADO,
                descripcionCorta: 'Almacenes de alimentos y textiles'
            },
            {
                id: 5,
                nombre: 'Observatorio Solar',
                nombreKichwa: 'Inti Rikuna',
                coordenadas: { x: 70, y: 30 },
                imagenUrl: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800',
                categoria: CategoriaPunto.OBSERVATORIO,
                desbloqueado: false,
                visitado: false,
                nivelDescubrimiento: NivelDescubrimiento.NO_VISITADO,
                descripcionCorta: 'Punto de observación astronómica',
                requisitos: [1, 2] // Templo y Plaza
            },
            {
                id: 6,
                nombre: 'Pileta Ceremonial',
                nombreKichwa: 'Yaku Pukyu',
                coordenadas: { x: 45, y: 65 },
                imagenUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
                categoria: CategoriaPunto.CEREMONIAL,
                desbloqueado: true,
                visitado: false,
                nivelDescubrimiento: NivelDescubrimiento.NO_VISITADO,
                descripcionCorta: 'Fuente de agua sagrada para rituales'
            }
        ];
    }

    private getMockNarrativa(puntoId: number, nivel: string): NarrativaGenerada {
        const narrativas: Record<number, Record<string, string>> = {
            1: {
                bronce: 'El Templo del Sol es la estructura más emblemática de Ingapirca. Construido con la técnica inca de piedra pulida, servía como centro ceremonial donde los sacerdotes realizaban ofrendas al Inti, el dios Sol.',
                plata: 'Este imponente templo elíptico combina arquitectura cañari e inca. Las piedras finamente talladas se ensamblan sin mortero, técnica conocida como "pirka". Los muros tienen una inclinación de 5 grados para resistir terremotos. Durante el Inti Raymi, el sol ilumina directamente el altar principal.',
                oro: 'El Templo del Sol representa la cumbre del sincretismo arquitectónico cañari-inca. Los cañaris veneraban aquí a la Luna antes de la llegada inca. Cuando Túpac Yupanqui conquistó la región en 1470, mandó construir este templo híbrido: elíptico (forma cañari asociada a la serpiente sagrada "Kan") pero con mampostería inca imperial. Las hornacinas interiores albergaban momias de ancestros, y el altar central se orientaba al solsticio de junio. Los sacerdotes realizaban capacocha, sacrificios rituales, durante eclipses solares.'
            }
        };

        return {
            puntoInteresId: puntoId,
            texto: narrativas[puntoId]?.[nivel] || 'Narrativa en construcción...',
            nivel: nivel as NivelDescubrimiento,
            elementosClave: ['Arquitectura inca', 'Ceremonias solares', 'Piedra pulida'],
            timestamp: new Date()
        };
    }
}
