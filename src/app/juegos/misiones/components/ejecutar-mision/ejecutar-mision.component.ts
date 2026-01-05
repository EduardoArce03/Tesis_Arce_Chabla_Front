import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { RadioButton } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { Textarea } from 'primeng/textarea';

import { MisionService } from '../../services/mision.service';
import { Blip2MockService } from '../../services/blip2-mock.service';

import {
    MisionCardDTO,
    DificultadMision,
    EstadoMision
} from '../../models/mision.model';

import {
    FaseMision,
    TipoFase,
    OpcionRespuesta,
    ElementoPuzzle,
} from '../../models/fase-mision.model';
import { SesionService } from '@/services/sesion.service';
import { ProgresoMision } from '@/models/fase-mision.model';
import { MapaIngapircaComponent } from '@/juegos/mapa-ingapirca/mapa-ingapirca.component';

@Component({
    selector: 'app-ejecutar-mision',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        ProgressBarModule,
        DialogModule,
        RadioButton,
        ToastModule,
        ProgressSpinnerModule,
        DividerModule,
        Textarea,
        TooltipModule,
        DragDropModule,
        MapaIngapircaComponent
    ],
    providers: [MessageService],
    templateUrl: './ejecutar-mision.component.html',
    styleUrls: ['./ejecutar-mision.component.scss']
})
export class EjecutarMisionComponent implements OnInit, OnDestroy {
    mision: any = null;
    misionId: number = 0;
    faseActual: FaseMision | null = null;
    progreso: ProgresoMision | null = null;

    // Estado de la fase
    cargandoAnalisis = false;
    analisisTexto = '';
    analisisCompleto = false;

    elementosOrdenamiento: ElementoPuzzle[] = [];
    ordenOriginal: string[] = [];
    ordenCorrecto: string[] = [];
    ordenCambiado = false;
    mostrandoResultadoOrden = false;
    ordenEsCorrecto = false;

    // Respuestas
    respuestaSeleccionada: string = '';
    respuestaAbierta: string = '';
    mostrandoFeedback = false;
    feedbackCorrecto = false;
    feedbackMensaje = '';

    // Control de narrativa typing
    narrativaVisible = '';
    narrativaCompleta = false;
    typingInterval: any;

    // Búsqueda de puntos
    puntosObjetivo: number[] = [];
    puntosVisitados: number[] = [];
    pistaActualBusqueda = '';
    mostrarDialogMapa = false;
    puntoActualMapa: number | null = null;

    // Diálogos
    mostrarDialogPista = false;
    pistaTexto = '';
    mostrarDialogAbandonar = false;
    mostrarDialogCompletada = false;

    // Cronómetro
    cronometroInterval: any;

    private destroy$ = new Subject<void>();

    // Enums para template
    TipoFase = TipoFase;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private misionService: MisionService,
        private sesionService: SesionService,
        private blip2Service: Blip2MockService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        const id = this.route.snapshot.paramMap.get('id');
        this.misionId = id ? parseInt(id) : 0;

        if (this.misionId) {
            this.cargarMision();
            this.iniciarCronometro();
        }
    }

    cargarMision(): void {
        this.misionService
            .obtenerMisionPorId(this.misionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (mision) => {
                    if (mision && mision.progreso) {
                        this.mision = mision;
                        this.progreso = mision.progreso;
                        this.cargarFaseActual();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Misión no iniciada o no encontrada'
                        });
                        this.router.navigate(['/juegos/misiones', this.misionId]);
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'En Desarrollo',
                        detail: 'La ejecución de misiones estará disponible próximamente'
                    });
                    setTimeout(() => {
                        this.router.navigate(['/juegos/misiones']);
                    }, 2000);
                }
            });
    }

    cargarFaseActual(): void {
        if (!this.mision || !this.progreso) return;

        const indiceFase = this.progreso.faseActual;
        this.faseActual = this.mision.fases[indiceFase];

        // Reset del estado
        this.respuestaSeleccionada = '';
        this.respuestaAbierta = '';
        this.mostrandoFeedback = false;
        this.analisisCompleto = false;
        this.narrativaCompleta = false;
        this.narrativaVisible = '';

        // Procesar según tipo de fase
        this.procesarFase();
    }

    procesarFase(): void {
        if (!this.faseActual) return;

        switch (this.faseActual.tipo) {
            case TipoFase.INTRODUCCION:
            case TipoFase.CONCLUSION:
                this.animarNarrativa(this.faseActual.textoNarrativa || '');
                break;

            case TipoFase.ANALISIS_IMAGEN:
                if (this.faseActual.usaBlip2) {
                    this.ejecutarAnalisisBlip2();
                } else if (this.faseActual.analisisBlip2) {
                    this.animarNarrativa(this.faseActual.analisisBlip2);
                    this.analisisCompleto = true;
                }
                break;

            case TipoFase.PREGUNTA_MULTIPLE:
            case TipoFase.PREGUNTA_ABIERTA:
                // Mostrar pregunta directamente
                break;

            case TipoFase.BUSQUEDA_PUNTO:
                this.procesarFaseBusqueda();
                break;

            case TipoFase.ORDENAMIENTO:
                this.procesarFaseOrdenamiento();
                break;
        }
    }

    procesarFaseBusqueda(): void {
        if (!this.faseActual || !this.faseActual.puntosObjetivo) return;

        this.puntosObjetivo = this.faseActual.puntosObjetivo;
        this.puntosVisitados = [];
        this.pistaActualBusqueda = '';
    }

    calcularProgresoBusqueda(): number {
        if (this.puntosObjetivo.length === 0) return 0;
        return (this.puntosVisitados.length / this.puntosObjetivo.length) * 100;
    }

    visitarPunto(puntoId: number): void {
        if (this.puntosVisitados.includes(puntoId)) return;

        this.puntoActualMapa = puntoId;
        this.mostrarDialogMapa = true;
    }

    onPuntoVisitadoEnMapa(): void {
        if (this.puntoActualMapa === null) return;

        this.puntosVisitados.push(this.puntoActualMapa);

        const index = this.puntosVisitados.length - 1;
        if (this.faseActual?.pistasProgreso) {
            this.pistaActualBusqueda = this.faseActual.pistasProgreso[index];
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Punto Visitado',
            detail: this.pistaActualBusqueda,
            life: 3000
        });

        this.mostrarDialogMapa = false;
        this.puntoActualMapa = null;

        if (this.puntosVisitados.length === this.puntosObjetivo.length) {
            this.messageService.add({
                severity: 'info',
                summary: '¡Búsqueda Completada!',
                detail: 'Has visitado todos los puntos. Continúa con la siguiente fase.',
                life: 3000
            });
        }
    }

    ejecutarAnalisisBlip2(): void {
        if (!this.faseActual) return;

        this.cargandoAnalisis = true;

        this.blip2Service
            .analizarImagen(this.faseActual.imagenUrl || '', { tipo: 'templo', dificultad: 'medio' })
            .pipe(takeUntil(this.destroy$))
            .subscribe((analisis) => {
                this.cargandoAnalisis = false;
                this.analisisCompleto = true;
                this.animarNarrativa(analisis);
            });
    }

    animarNarrativa(texto: string): void {
        this.narrativaVisible = '';
        this.narrativaCompleta = false;
        let index = 0;

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        this.typingInterval = setInterval(() => {
            if (index < texto.length) {
                this.narrativaVisible += texto.charAt(index);
                index++;
            } else {
                clearInterval(this.typingInterval);
                this.narrativaCompleta = true;
            }
        }, 30);
    }

    saltarAnimacion(): void {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.narrativaVisible = this.faseActual?.textoNarrativa || this.faseActual?.analisisBlip2 || '';
            this.narrativaCompleta = true;
        }
    }

    verificarRespuesta(): void {
        if (!this.faseActual || !this.faseActual.pregunta) return;

        let correcta = false;
        let explicacion = '';

        if (this.faseActual.pregunta.tipo === 'multiple') {
            const opcionSeleccionada = this.faseActual.pregunta.opciones?.find((o) => o.id === this.respuestaSeleccionada);

            if (opcionSeleccionada) {
                correcta = opcionSeleccionada.correcta;
                explicacion = opcionSeleccionada.explicacion || this.faseActual.pregunta.explicacion;
            }
        } else if (this.faseActual.pregunta.tipo === 'abierta') {
            const respuestaCorrecta = this.faseActual.pregunta.respuestaCorrecta as string;
            correcta = this.respuestaAbierta.toLowerCase().includes(respuestaCorrecta.toLowerCase());
            explicacion = this.faseActual.pregunta.explicacion;
        }

        this.misionService.registrarRespuesta(this.misionId.toString(), correcta)
            .pipe(takeUntil(this.destroy$))
            .subscribe();

        this.feedbackCorrecto = correcta;
        this.feedbackMensaje = explicacion;
        this.mostrandoFeedback = true;

        if (correcta) {
            this.messageService.add({
                severity: 'success',
                summary: '¡Correcto!',
                detail: 'Respuesta acertada',
                life: 2000
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Incorrecto',
                detail: 'Intenta de nuevo',
                life: 2000
            });
        }
    }

    procesarFaseOrdenamiento(): void {
        if (!this.faseActual || !this.faseActual.puzzle) return;

        this.elementosOrdenamiento = [...this.faseActual.puzzle.elementos]
            .sort(() => Math.random() - 0.5);

        this.ordenOriginal = this.elementosOrdenamiento.map(e => e.id);
        this.ordenCorrecto = this.faseActual.puzzle.solucion as string[];
        this.ordenCambiado = false;
        this.mostrandoResultadoOrden = false;
        this.ordenEsCorrecto = false;
    }

    onDropOrdenamiento(event: CdkDragDrop<ElementoPuzzle[]>): void {
        moveItemInArray(
            this.elementosOrdenamiento,
            event.previousIndex,
            event.currentIndex
        );
        this.ordenCambiado = true;
    }

    verificarOrdenamiento(): void {
        const ordenActual = this.elementosOrdenamiento.map(e => e.id);
        this.ordenEsCorrecto = JSON.stringify(ordenActual) === JSON.stringify(this.ordenCorrecto);
        this.mostrandoResultadoOrden = true;

        if (this.ordenEsCorrecto) {
            this.misionService.registrarRespuesta(this.misionId.toString(), true)
                .pipe(takeUntil(this.destroy$))
                .subscribe();

            this.messageService.add({
                severity: 'success',
                summary: '¡Correcto!',
                detail: 'Has ordenado el ciclo correctamente',
                life: 3000
            });
        } else {
            this.misionService.registrarRespuesta(this.misionId.toString(), false)
                .pipe(takeUntil(this.destroy$))
                .subscribe();

            this.messageService.add({
                severity: 'error',
                summary: 'Incorrecto',
                detail: 'El orden no es correcto. Intenta de nuevo.',
                life: 3000
            });
        }
    }

    reintentar(): void {
        this.procesarFaseOrdenamiento();
    }

    avanzarFase(): void {
        if (!this.mision) return;

        this.misionService
            .avanzarFase(this.misionId.toString())
            .pipe(takeUntil(this.destroy$))
            .subscribe((resultado: any) => {
                if (resultado) {
                    this.cargarMision();
                } else {
                    this.mostrarDialogCompletada = true;
                    this.detenerCronometro();
                }
            });
    }

    usarPista(): void {
        if (!this.faseActual || !this.faseActual.pregunta) return;

        this.misionService.usarPista(this.misionId.toString())
            .pipe(takeUntil(this.destroy$))
            .subscribe();

        this.pistaTexto = this.faseActual.pregunta.pista || 'No hay pistas disponibles';
        this.mostrarDialogPista = true;
    }

    abandonarMision(): void {
        this.misionService
            .abandonarMision(this.misionId.toString())
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Misión Abandonada',
                    detail: 'Puedes retomarla cuando quieras'
                });

                setTimeout(() => {
                    this.router.navigate(['/juegos/misiones']);
                }, 1500);
            });
    }

    finalizarMision(): void {
        this.router.navigate(['/juegos/misiones', this.misionId]);
    }

    private iniciarCronometro(): void {
        this.cronometroInterval = interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.progreso) {
                    this.progreso.tiempoTranscurrido++;
                }
            });
    }

    private detenerCronometro(): void {
        if (this.cronometroInterval) {
            this.cronometroInterval.unsubscribe();
        }
    }

    calcularProgreso(): number {
        if (!this.mision || !this.progreso) return 0;
        return (this.progreso.faseActual / this.mision.fases.length) * 100;
    }

    formatearTiempo(segundos: number): string {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        this.detenerCronometro();
    }
}
