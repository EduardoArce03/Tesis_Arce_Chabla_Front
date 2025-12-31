import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // 👈 AGREGAR
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';  // 👈 CAMBIAR de TabViewModule
import { RadioButton } from 'primeng/radiobutton';  // 👈 CAMBIAR de RadioButtonModule
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

import { ExploracionService } from '@/services/explorasion.service';
import { SesionService } from '../../services/sesion.service';
import {
    DashboardExploracionResponse,
    PuntoInteresDTO,
    DetallePuntoResponse,
    PreguntaQuizDTO,
    ArtefactoDTO,
    CategoriaPunto,
    NivelDescubrimiento
} from '../../models/explorasion.model';

@Component({
    selector: 'app-exploracion-ingapirca',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,  // 👈 AGREGAR para ngModel
        CardModule,
        ButtonModule,
        TooltipModule,
        DialogModule,
        ProgressBarModule,
        BadgeModule,
        TagModule,
        ToastModule,
        Tabs,  // 👈 CAMBIAR
        RadioButton,
        TabPanel,
        TabList,
        Tab,
        TabPanels,
  // 👈 CAMBIAR
    ],
    providers: [MessageService],
    templateUrl: './exploracion-ingapirca.component.html',
    styleUrls: ['./exploracion-ingapirca.component.scss']
})
export class ExploracionIngapircaComponent implements OnInit, OnDestroy {
    dashboard?: DashboardExploracionResponse;
    puntoSeleccionado?: PuntoInteresDTO;
    detallePunto?: DetallePuntoResponse;

    mostrarDetalle = false;
    mostrarQuiz = false;
    mostrarColeccion = false;

    preguntaActual?: PreguntaQuizDTO;
    respuestaSeleccionada?: string;

    tiempoInicio?: Date;
    tiempoTranscurrido = 0;
    intervalTimer: any;

    buscandoArtefacto = false;
    cargando = true;

    // Enums para template

    private destroy$ = new Subject<void>();

    constructor(
        private exploracionService: ExploracionService,
        private sesionService: SesionService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const usuario = this.sesionService.getUsuario();

        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        this.cargarDashboard(usuario.id);
    }

    cargarDashboard(usuarioId: number): void {
        this.cargando = true;

        this.exploracionService.obtenerDashboard(usuarioId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.dashboard = data;
                    this.cargando = false;
                },
                error: (error) => {
                    console.error('Error cargando dashboard:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo cargar el mapa de exploración'
                    });
                    this.cargando = false;
                }
            });
    }

    seleccionarPunto(punto: PuntoInteresDTO): void {
        if (!punto.desbloqueado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Punto Bloqueado',
                detail: `Necesitas nivel ${punto.nivelRequerido} de arqueólogo`
            });
            return;
        }

        const usuario = this.sesionService.getUsuario();
        if (!usuario) return;

        this.puntoSeleccionado = punto;
        this.tiempoInicio = new Date();
        this.tiempoTranscurrido = 0;

        // Iniciar contador de tiempo
        this.iniciarContador();

        // Cargar detalle del punto
        this.exploracionService.obtenerDetallePunto(punto.id, usuario.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (detalle) => {
                    this.detallePunto = detalle;
                    this.mostrarDetalle = true;
                },
                error: (error) => {
                    console.error('Error cargando detalle:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo cargar el detalle del punto'
                    });
                }
            });
    }

    iniciarContador(): void {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }

        this.intervalTimer = setInterval(() => {
            if (this.tiempoInicio) {
                this.tiempoTranscurrido = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);
            }
        }, 1000);
    }

    completarVisita(): void {
        // 👇 Validaciones más estrictas
        if (!this.puntoSeleccionado || !this.tiempoInicio) {
            console.error('Punto seleccionado o tiempo de inicio no definido');
            return;
        }

        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        // 👇 Verificar que el ID existe
        const puntoId = this.puntoSeleccionado.id;
        if (!puntoId) {
            console.error('ID del punto no disponible');
            return;
        }

        const tiempoSegundos = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);

        this.exploracionService.visitarPunto({
            usuarioId: usuario.id,
            puntoId: puntoId,  // 👈 Ahora TypeScript sabe que no es undefined
            tiempoSegundos: tiempoSegundos
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (resultado) => {
                    // Mostrar resultados
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Exploración Completada!',
                        detail: `+${resultado.experienciaGanada} XP ganados`,
                        life: 5000
                    });

                    if (resultado.artefactoEncontrado) {
                        this.messageService.add({
                            severity: 'success',
                            summary: '¡Artefacto Encontrado!',
                            detail: `${resultado.artefactoEncontrado.nombre} - ${this.getRarezaEstrellas(resultado.artefactoEncontrado.rareza)}`,
                            life: 8000
                        });
                    }

                    if (resultado.nivelSubido) {
                        this.messageService.add({
                            severity: 'success',
                            summary: '🎉 ¡Nivel Subido!',
                            detail: `Ahora eres nivel ${resultado.nuevoNivel} arqueólogo`,
                            life: 10000
                        });
                    }

                    this.cerrarDetalle();
                    this.cargarDashboard(usuario.id);
                },
                error: (error) => {
                    console.error('Error completando visita:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo completar la visita'
                    });
                }
            });
    }

    iniciarQuiz(): void {
        if (!this.detallePunto?.quiz || this.detallePunto.quiz.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'No hay preguntas',
                detail: 'Este punto no tiene quiz disponible'
            });
            return;
        }

        // Tomar pregunta aleatoria
        const preguntas = this.detallePunto.quiz;
        this.preguntaActual = preguntas[Math.floor(Math.random() * preguntas.length)];
        this.respuestaSeleccionada = undefined;
        this.mostrarQuiz = true;
    }

    responderQuiz(): void {
        if (!this.preguntaActual || !this.respuestaSeleccionada || !this.puntoSeleccionado) {
            return;
        }

        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        // 👇 Verificar IDs
        const puntoId = this.puntoSeleccionado.id;
        const preguntaId = this.preguntaActual.id;

        if (!puntoId || !preguntaId) {
            console.error('IDs no disponibles');
            return;
        }

        this.exploracionService.responderQuiz({
            usuarioId: usuario.id,
            puntoId: puntoId,
            preguntaId: preguntaId,
            respuesta: this.respuestaSeleccionada
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (resultado) => {
                    if (resultado.correcto) {
                        this.messageService.add({
                            severity: 'success',
                            summary: '✅ ¡Correcto!',
                            detail: `${resultado.explicacion}\n+${resultado.experienciaGanada} XP`,
                            life: 8000
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: '❌ Incorrecto',
                            detail: resultado.explicacion,
                            life: 8000
                        });
                    }

                    this.mostrarQuiz = false;

                    if (resultado.correcto && usuario) {
                        this.cargarDashboard(usuario.id);
                    }
                },
                error: (error) => {
                    console.error('Error respondiendo quiz:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo procesar la respuesta'
                    });
                }
            });
    }

    buscarArtefacto(): void {
        if (!this.puntoSeleccionado || this.buscandoArtefacto) {
            return;
        }

        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        // 👇 Verificar que el ID existe
        const puntoId = this.puntoSeleccionado.id;
        if (!puntoId) {
            console.error('ID del punto no disponible');
            return;
        }

        this.buscandoArtefacto = true;

        this.exploracionService.buscarArtefacto({
            usuarioId: usuario.id,
            puntoId: puntoId  // 👈 Ahora TypeScript sabe que no es undefined
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (resultado) => {
                    if (resultado.encontrado && resultado.artefacto) {
                        this.messageService.add({
                            severity: 'success',
                            summary: '🎉 ¡Artefacto Encontrado!',
                            detail: `${resultado.artefacto.nombre} (${resultado.artefacto.nombreKichwa})\n+${resultado.experienciaGanada} XP`,
                            life: 10000
                        });
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Sin suerte',
                            detail: resultado.mensaje,
                            life: 5000
                        });
                    }

                    this.buscandoArtefacto = false;

                    if (usuario) {
                        this.cargarDashboard(usuario.id);
                    }
                },
                error: (error) => {
                    console.error('Error buscando artefacto:', error);
                    this.buscandoArtefacto = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo buscar el artefacto'
                    });
                }
            });
    }

    verColeccion(): void {
        this.mostrarColeccion = true;
    }

    cerrarDetalle(): void {
        this.mostrarDetalle = false;
        this.puntoSeleccionado = undefined;
        this.detallePunto = undefined;

        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }
    }

    // Helpers
    getNivelColor(nivel: NivelDescubrimiento): string {
        const colores: Record<NivelDescubrimiento, string> = {
            [NivelDescubrimiento.NO_VISITADO]: '#999',
            [NivelDescubrimiento.BRONCE]: '#CD7F32',
            [NivelDescubrimiento.PLATA]: '#C0C0C0',
            [NivelDescubrimiento.ORO]: '#FFD700'
        };
        return colores[nivel];
    }

    getNivelLabel(nivel: NivelDescubrimiento): string {
        const labels: Record<NivelDescubrimiento, string> = {
            [NivelDescubrimiento.NO_VISITADO]: 'No Visitado',
            [NivelDescubrimiento.BRONCE]: 'Bronce',
            [NivelDescubrimiento.PLATA]: 'Plata',
            [NivelDescubrimiento.ORO]: 'Oro'
        };
        return labels[nivel];
    }

    getCategoriaIcono(categoria: CategoriaPunto): string {
        const iconos: Record<CategoriaPunto, string> = {
            [CategoriaPunto.TEMPLO]: '⛩️',
            [CategoriaPunto.PLAZA]: '🏛️',
            [CategoriaPunto.VIVIENDA]: '🏠',
            [CategoriaPunto.DEPOSITO]: '📦',
            [CategoriaPunto.OBSERVATORIO]: '🔭',
            [CategoriaPunto.CEREMONIAL]: '✨',
            [CategoriaPunto.CAMINO]: '🛤️',
            [CategoriaPunto.FUENTE]: '⛲'
        };
        return iconos[categoria];
    }

    getRarezaEstrellas(rareza: number): string {
        return '⭐'.repeat(rareza);
    }

    formatearTiempo(segundos: number): string {
        const mins = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${mins}:${segs.toString().padStart(2, '0')}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }
    }
}
