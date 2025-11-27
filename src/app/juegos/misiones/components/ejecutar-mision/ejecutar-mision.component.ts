// components/ejecutar-mision/ejecutar-mision.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

import { Blip2MockService } from '../../services/blip2-mock.service';
import { Mision, ProgresoMision } from '../../models/mision.model';
import { FaseMision, TipoFase, OpcionRespuesta } from '../../models/fase-mision.model';
import { MisionService } from '@/juegos/misiones/services/mision..service';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-ejecutar-mision',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, ProgressBarModule, DialogModule, RadioButtonModule, ToastModule, ProgressSpinnerModule, DividerModule, Textarea, Tooltip],
    providers: [MessageService],
    templateUrl: './ejecutar-mision.component.html',
    styleUrls: ['./ejecutar-mision.component.scss']
})
export class EjecutarMisionComponent implements OnInit, OnDestroy {
    mision: Mision | null = null;
    misionId: string = '';
    faseActual: FaseMision | null = null;
    progreso: ProgresoMision | null = null;

    // Estado de la fase
    cargandoAnalisis = false;
    analisisTexto = '';
    analisisCompleto = false;

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
        private blip2Service: Blip2MockService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.misionId = this.route.snapshot.paramMap.get('id') || '';
        this.cargarMision();
        this.iniciarCronometro();
    }

    cargarMision(): void {
        this.misionService
            .obtenerMisionPorId(this.misionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((mision) => {
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
                    this.router.navigate(['/misiones', this.misionId]);
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
            // Validación simple - en producción podrías usar IA
            const respuestaCorrecta = this.faseActual.pregunta.respuestaCorrecta as string;
            correcta = this.respuestaAbierta.toLowerCase().includes(respuestaCorrecta.toLowerCase());
            explicacion = this.faseActual.pregunta.explicacion;
        }

        // Registrar respuesta
        this.misionService.registrarRespuesta(this.misionId, correcta).pipe(takeUntil(this.destroy$)).subscribe();

        // Mostrar feedback
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

    avanzarFase(): void {
        if (!this.mision) return;

        this.misionService
            .avanzarFase(this.misionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((resultado: any) => {
                if (resultado) {
                    // Recargar misión actualizada
                    this.cargarMision();
                } else {
                    // Misión completada
                    this.mostrarDialogCompletada = true;
                    this.detenerCronometro();
                }
            });
    }

    usarPista(): void {
        if (!this.faseActual || !this.faseActual.pregunta) return;

        this.misionService.usarPista(this.misionId).pipe(takeUntil(this.destroy$)).subscribe();

        this.pistaTexto = this.faseActual.pregunta.pista || 'No hay pistas disponibles';
        this.mostrarDialogPista = true;
    }

    abandonarMision(): void {
        this.misionService
            .abandonarMision(this.misionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Misión Abandonada',
                    detail: 'Puedes retomarla cuando quieras'
                });

                setTimeout(() => {
                    this.router.navigate(['/misiones']);
                }, 1500);
            });
    }

    finalizarMision(): void {
        this.router.navigate(['/misiones', this.misionId]);
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
