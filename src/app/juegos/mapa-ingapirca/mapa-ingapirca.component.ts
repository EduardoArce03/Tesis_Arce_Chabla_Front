// mapa-ingapirca.component.ts - REFACTORIZADO CON PERSISTENCIA

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { MessageService } from 'primeng/api';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { FileUpload } from 'primeng/fileupload';

// Servicios
import {
    ExploracionService,
    MapaDTO,
    PuntoDTO,
    CapaDTO,
    CapaNivel,
    ExplorarCapaRequest,
    CapturarFotoRequest,
    DialogarRequest,
    ObjetivoFotoDTO,
    NarrativaDTO
} from '@/services/exploracion_final.service';
import { SesionService } from '@/services/sesion.service';
import { TextToSpeechService } from '@/components/text-to-speech.service';

@Component({
    selector: 'app-mapa-ingapirca',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        TooltipModule,
        DialogModule,
        ProgressBarModule,
        ToastModule,
        FileUpload
    ],
    providers: [MessageService],
    templateUrl: './mapa-ingapirca.component.html',
    styleUrls: ['./mapa-ingapirca.component.scss']
})
export class MapaIngapircaComponent implements OnInit, OnDestroy {
    @Input() puntoDestacado: number | null = null;
    @Output() puntoVisitado = new EventEmitter<number>();

    // ==================== ESTADO GLOBAL ====================
    partidaId: number | null = null;
    jugadorId: number = 0;
    mapa: MapaDTO | null = null;

    // ==================== MODAL 1: CAPAS DEL PUNTO ====================
    mostrarModalCapas = false;
    puntoSeleccionado: PuntoDTO | null = null;

    // ==================== MODAL 2: EXPLORACIÓN DE CAPA ====================
    mostrarModalExploracion = false;
    capaActiva: CapaDTO | null = null;
    tabActivo = 0;

    // Narrativa actual
    narrativaActual: NarrativaDTO | null = null;
    narrativaVisible = '';
    narrativaCompleta = false;
    cargandoNarrativa = false;
    typingInterval: any;

    // Objetivos fotográficos
    objetivosFotograficos: ObjetivoFotoDTO[] = [];
    cargandoFoto = false;

    // Modal resultado foto
    mostrarResultadoFoto = false;
    resultadoFotoAnalisis: any = null;

    // Diálogo
    preguntaDialogo = '';
    preguntaActual = '';
    mostrarRespuestaEspiritu = false;
    respuestaEspiritu = '';
    respuestaEspirituVisible = '';
    nombreEspirituActual = '';
    cargandoRespuesta = false;
    typingIntervalEspiritu: any;
    respuestaCompletaEspiritu = false;

    // Caminos SVG
    caminosSVG: string[] = [];

    // Auto-refresh para sincronizar estado
    private autoRefresh$ = interval(5000); // cada 5 segundos
    private destroy$ = new Subject<void>();

    // Enums para template
    CapaNivel = CapaNivel;

    // Storage keys
    private readonly STORAGE_PARTIDA_ID = 'ingapirca_partida_id';
    private readonly STORAGE_JUGADOR_ID = 'ingapirca_jugador_id';

    constructor(
        private exploracionService: ExploracionService,
        private messageService: MessageService,
        private sesionService: SesionService,
        private tts: TextToSpeechService
    ) {}

    // ==================== LIFECYCLE ====================

    ngOnInit(): void {
        console.log('🚀 Inicializando componente...');

        this.jugadorId = this.sesionService.getUsuario()?.id || 0;

        if (this.jugadorId === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No hay usuario en sesión'
            });
            return;
        }

        // Intentar recuperar partida existente
        this.recuperarPartidaExistente();

        // Auto-refresh del mapa
        this.autoRefresh$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.partidaId && !this.mostrarModalExploracion) {
                    this.cargarMapaSilencioso();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        if (this.typingIntervalEspiritu) {
            clearInterval(this.typingIntervalEspiritu);
        }
    }

    // ==================== PERSISTENCIA ====================

    private recuperarPartidaExistente(): void {
        const partidaGuardada = localStorage.getItem(this.STORAGE_PARTIDA_ID);
        const jugadorGuardado = localStorage.getItem(this.STORAGE_JUGADOR_ID);

        console.log('🔍 Verificando partida guardada:', { partidaGuardada, jugadorGuardado });

        if (partidaGuardada && jugadorGuardado === this.jugadorId.toString()) {
            this.partidaId = parseInt(partidaGuardada);
            console.log('✅ Recuperando partida existente:', this.partidaId);
            this.cargarMapa();
        } else {
            console.log('🆕 Iniciando nueva partida');
            this.iniciarPartida();
        }
    }

    private guardarPartidaEnStorage(): void {
        if (this.partidaId) {
            localStorage.setItem(this.STORAGE_PARTIDA_ID, this.partidaId.toString());
            localStorage.setItem(this.STORAGE_JUGADOR_ID, this.jugadorId.toString());
            console.log('💾 Partida guardada en localStorage');
        }
    }

    // ==================== INICIALIZACIÓN ====================

    iniciarPartida(): void {
        console.log('🎮 Iniciando partida para jugador:', this.jugadorId);

        this.exploracionService.iniciarPartida(this.jugadorId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (partida) => {
                    this.partidaId = partida.id;
                    console.log('✅ Partida creada:', this.partidaId);

                    // Guardar en storage
                    this.guardarPartidaEnStorage();

                    this.cargarMapa();
                },
                error: (error) => {
                    console.error('❌ Error iniciando partida:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo iniciar la partida'
                    });
                }
            });
    }

    cargarMapa(): void {
        if (!this.partidaId) return;

        console.log('🗺️ Cargando mapa de partida:', this.partidaId);

        this.exploracionService.obtenerMapa(this.partidaId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (mapa) => {
                    this.mapa = mapa;
                    console.log('✅ Mapa cargado:', {
                        puntos: mapa.puntos.length,
                        explorados: mapa.puntosExplorados,
                        fotos: mapa.fotografiasCapturadas,
                        dialogos: mapa.dialogosRealizados
                    });

                    // Actualizar progreso en la UI si hay capa activa
                    if (this.capaActiva && this.puntoSeleccionado) {
                        this.actualizarCapaActiva();
                    }

                    // Generar caminos SVG
                    this.generarCaminos();

                    // Si hay punto destacado, seleccionarlo
                    if (this.puntoDestacado) {
                        setTimeout(() => {
                            this.seleccionarPuntoAutomaticamente(this.puntoDestacado!);
                        }, 500);
                    }
                },
                error: (error) => {
                    console.error('❌ Error cargando mapa:', error);

                    // Si falla, limpiar storage y reintentar
                    if (error.status === 404) {
                        console.log('⚠️ Partida no encontrada, iniciando nueva...');
                        localStorage.removeItem(this.STORAGE_PARTIDA_ID);
                        this.partidaId = null;
                        this.iniciarPartida();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo cargar el mapa'
                        });
                    }
                }
            });
    }

    private cargarMapaSilencioso(): void {
        if (!this.partidaId) return;

        this.exploracionService.obtenerMapa(this.partidaId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (mapa) => {
                    this.mapa = mapa;

                    // Actualizar capa activa si existe
                    if (this.capaActiva && this.puntoSeleccionado) {
                        this.actualizarCapaActiva();
                    }
                },
                error: () => {
                    // Silencioso - no mostrar error
                }
            });
    }

    private actualizarCapaActiva(): void {
        if (!this.mapa || !this.puntoSeleccionado || !this.capaActiva) return;

        const puntoActualizado = this.mapa.puntos.find(p => p.id === this.puntoSeleccionado!.id);

        if (puntoActualizado) {
            const capaActualizada = puntoActualizado.capas.find(
                c => c.nivel === this.capaActiva!.nivel
            );

            if (capaActualizada) {
                // Actualizar progreso
                this.capaActiva = capaActualizada;

                // Actualizar objetivos fotográficos
                this.actualizarObjetivosFotograficos(capaActualizada);

                console.log('🔄 Capa activa actualizada:', {
                    narrativa: capaActualizada.narrativaLeida,
                    fotos: `${capaActualizada.fotografiasCompletadas}/${capaActualizada.fotografiasRequeridas}`,
                    dialogos: capaActualizada.dialogosRealizados,
                    porcentaje: capaActualizada.porcentaje.toFixed(0) + '%'
                });
            }
        }
    }

    private actualizarObjetivosFotograficos(capa: CapaDTO): void {
        // Mantener el estado de completadas
        this.objetivosFotograficos.forEach(objetivo => {
            const estadoActual = capa.fotografiasCompletadas;
            // Aquí necesitarías lógica adicional del backend que devuelva qué objetivos específicos están completados
        });
    }

    seleccionarPuntoAutomaticamente(puntoId: number): void {
        if (!this.mapa) return;

        const punto = this.mapa.puntos.find(p => p.id === puntoId);
        if (punto) {
            this.seleccionarPunto(punto);
        }
    }

    // ==================== FLUJO: SELECCIONAR PUNTO → MODAL CAPAS ====================

    seleccionarPunto(punto: PuntoDTO): void {
        console.log('📍 Punto seleccionado:', punto.nombre);

        this.puntoSeleccionado = punto;
        this.mostrarModalCapas = true;

        // Emitir evento
        this.puntoVisitado.emit(punto.id);
    }

    cerrarModalCapas(): void {
        if (!this.mostrarModalExploracion) {
            this.puntoSeleccionado = null;
        }
    }

    // ==================== FLUJO: EXPLORAR CAPA → MODAL EXPLORACIÓN ====================

    abrirExploracionCapa(capa: CapaDTO): void {
        console.log('🔍 Explorando capa:', capa.nombre);

        if (!capa.desbloqueada) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Capa Bloqueada',
                detail: 'Debes completar la capa anterior primero'
            });
            return;
        }

        if (!this.partidaId || !this.puntoSeleccionado) return;

        const request: ExplorarCapaRequest = {
            partidaId: this.partidaId,
            puntoId: this.puntoSeleccionado.id,
            capaNivel: capa.nivel
        };

        this.exploracionService.explorarCapa(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    console.log('✅ Capa explorada:', response);

                    if (response.exito) {
                        this.mostrarModalCapas = false;
                        this.capaActiva = response.capa;
                        this.narrativaActual = response.narrativa;
                        this.objetivosFotograficos = response.objetivosFotograficos;
                        this.mostrarModalExploracion = true;
                        this.tabActivo = 0;

                        // Cargar narrativa
                        if (response.primerDescubrimiento || !response.capa.narrativaLeida) {
                            this.cargarNarrativa(response.narrativa);
                        } else {
                            this.narrativaVisible = response.narrativa.texto;
                            this.narrativaCompleta = true;
                        }

                        // Recargar mapa para reflejar cambios
                        this.cargarMapa();
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Error',
                            detail: response.mensaje || 'No se pudo explorar la capa'
                        });
                    }
                },
                error: (error) => {
                    console.error('❌ Error explorando capa:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo acceder a la capa'
                    });
                }
            });
    }

    cambiarTab(index: number): void {
        this.tabActivo = index;
    }

    volverACapas(): void {
        this.mostrarModalExploracion = false;
        this.capaActiva = null;
        this.narrativaActual = null;
        this.objetivosFotograficos = [];
        this.tabActivo = 0;

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        // Reabrir modal de capas
        this.mostrarModalCapas = true;

        // Recargar mapa
        this.cargarMapa();
    }

    cerrarModalExploracion(): void {
        this.mostrarModalExploracion = false;
        this.capaActiva = null;
        this.narrativaActual = null;
        this.objetivosFotograficos = [];
        this.tabActivo = 0;

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        // Recargar mapa
        this.cargarMapa();
    }

    // ==================== NARRATIVA ====================

    cargarNarrativa(narrativa: NarrativaDTO): void {
        this.cargandoNarrativa = true;
        this.narrativaVisible = '';
        this.narrativaCompleta = false;

        setTimeout(() => {
            this.cargandoNarrativa = false;
            this.animarTexto(narrativa.texto);
            this.tts.narrar(narrativa.texto);
        }, 1500);
    }

    animarTexto(texto: string): void {
        let index = 0;
        this.narrativaVisible = '';
        this.narrativaCompleta = false;

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
        if (this.typingInterval && this.narrativaActual) {
            clearInterval(this.typingInterval);
            this.narrativaVisible = this.narrativaActual.texto;
            this.narrativaCompleta = true;
        }
    }

    // ==================== FOTOGRAFÍA ====================

    async procesarFotografia(event: any, objetivo: ObjetivoFotoDTO): Promise<void> {
        if (!event.files || event.files.length === 0 || !this.partidaId || !this.capaActiva) {
            return;
        }

        const file = event.files[0] as File;

        console.log('📸 Procesando fotografía:', {
            nombre: file.name,
            objetivo: objetivo.id
        });

        if (!this.exploracionService.validarFormatoImagen(file)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Formato Inválido',
                detail: 'Solo se permiten imágenes JPG, PNG o WebP'
            });
            return;
        }

        if (!this.exploracionService.validarTamanoImagen(file, 5)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Archivo muy Grande',
                detail: 'La imagen no debe superar 5MB'
            });
            return;
        }

        this.cargandoFoto = true;

        try {
            const imagenBase64 = await this.exploracionService.convertirImagenABase64(file);

            const request: CapturarFotoRequest = {
                partidaId: this.partidaId,
                progresoCapaId: this.capaActiva.id,
                objetivoId: objetivo.id,
                imagenBase64: imagenBase64
            };

            this.exploracionService.capturarFotografia(request)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (response) => {
                        this.cargandoFoto = false;

                        // Guardar resultado para el modal
                        this.resultadoFotoAnalisis = {
                            exito: response.exito,
                            mensaje: response.mensaje,
                            objetivo: objetivo,
                            descripcionIA: response.descripcionIA || 'Sin descripción disponible',
                            puntos: response.puntos || 0,
                            fotografiasCompletadas: response.fotografiasCompletadas,
                            fotografiasRequeridas: response.fotografiasRequeridas,
                            imagenBase64: imagenBase64
                        };

                        // Mostrar modal con resultado
                        this.mostrarResultadoFoto = true;

                        if (response.exito) {
                            // Marcar objetivo localmente INMEDIATAMENTE
                            objetivo.completada = true;

                            // Recargar mapa en background
                            this.cargarMapa();

                            // Verificar completitud
                            const todasCompletadas = this.objetivosFotograficos.every(obj => obj.completada);
                            if (todasCompletadas) {
                                setTimeout(() => {
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: '✨ ¡Todas las Fotos Capturadas!',
                                        detail: 'Continúa con el diálogo para completar la capa',
                                        life: 5000
                                    });
                                }, 2000);
                            }
                        }
                    },
                    error: (error) => {
                        this.cargandoFoto = false;
                        console.error('❌ Error:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo procesar la fotografía'
                        });
                    }
                });

        } catch (error) {
            this.cargandoFoto = false;
            console.error('❌ Error leyendo archivo:', error);
        }
    }

    cerrarResultadoFoto(): void {
        this.mostrarResultadoFoto = false;
        this.resultadoFotoAnalisis = null;
    }

    obtenerPorcentajeConfianza(): number {
        if (!this.resultadoFotoAnalisis) return 0;
        // Calcular porcentaje basado en puntos
        const maxPuntos = 50;
        return Math.min((this.resultadoFotoAnalisis.puntos / maxPuntos) * 100, 100);
    }

    obtenerColorConfianza(): string {
        const porcentaje = this.obtenerPorcentajeConfianza();
        if (porcentaje >= 80) return '#4CAF50'; // Verde
        if (porcentaje >= 60) return '#FFC107'; // Amarillo
        return '#FF5722'; // Rojo
    }

    marcarCompletadoManual(objetivo: ObjetivoFotoDTO): void {
        const confirmado = window.confirm(
            '¿Marcar este objetivo como completado sin validación?\n\n' +
            '⚠️ Recibirás menos recompensas.\n\n' +
            'Presiona OK para continuar.'
        );

        if (!confirmado || !this.partidaId || !this.capaActiva) {
            return;
        }

        const request: CapturarFotoRequest = {
            partidaId: this.partidaId,
            progresoCapaId: this.capaActiva.id,
            objetivoId: objetivo.id
        };

        this.exploracionService.capturarFotografia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.exito) {
                        objetivo.completada = true;

                        this.messageService.add({
                            severity: 'success',
                            summary: '✅ Objetivo Completado',
                            detail: 'Objetivo marcado como completado'
                        });

                        this.cargarMapa();
                    }
                },
                error: (error) => {
                    console.error('❌ Error:', error);
                }
            });
    }

    // ==================== DIÁLOGO ====================

    enviarPregunta(): void {
        if (!this.preguntaDialogo.trim() || !this.partidaId || !this.capaActiva) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Datos incompletos',
                detail: 'Debes escribir una pregunta válida'
            });
            return;
        }

        this.preguntaActual = this.preguntaDialogo;
        this.cargandoRespuesta = true;

        const request: DialogarRequest = {
            partidaId: this.partidaId,
            progresoCapaId: this.capaActiva.id,
            pregunta: this.preguntaDialogo
        };

        this.exploracionService.dialogar(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.cargandoRespuesta = false;

                    if (response.exito) {
                        this.respuestaEspiritu = response.respuesta;
                        this.nombreEspirituActual = response.nombreEspiritu;
                        this.mostrarRespuestaEspiritu = true;

                        this.animarRespuestaEspiritu(response.respuesta);
                        this.preguntaDialogo = '';

                        // Recargar mapa
                        this.cargarMapa();

                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Sin Respuesta',
                            detail: response.mensaje || 'El espíritu no pudo responder'
                        });
                    }
                },
                error: (error) => {
                    this.cargandoRespuesta = false;
                    console.error('❌ Error:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo comunicar con el espíritu'
                    });
                }
            });
    }

    private animarRespuestaEspiritu(texto: string): void {
        this.respuestaEspirituVisible = '';
        this.respuestaCompletaEspiritu = false;

        if (this.typingIntervalEspiritu) {
            clearInterval(this.typingIntervalEspiritu);
        }

        let index = 0;
        this.typingIntervalEspiritu = setInterval(() => {
            if (index < texto.length) {
                this.respuestaEspirituVisible += texto.charAt(index);
                index++;
            } else {
                clearInterval(this.typingIntervalEspiritu);
                this.respuestaCompletaEspiritu = true;
            }
        }, 30);
    }

    saltarAnimacionEspiritu(): void {
        if (this.typingIntervalEspiritu) {
            clearInterval(this.typingIntervalEspiritu);
            this.respuestaEspirituVisible = this.respuestaEspiritu;
            this.respuestaCompletaEspiritu = true;
        }
    }

    cerrarRespuestaEspiritu(): void {
        this.mostrarRespuestaEspiritu = false;

        if (this.typingIntervalEspiritu) {
            clearInterval(this.typingIntervalEspiritu);
        }
    }

    // ==================== UTILIDADES ====================

    puntosVisitados(): number {
        if (!this.mapa) return 0;
        return this.mapa.puntos.filter(p => p.explorado).length;
    }

    porcentajeVisitados(): number {
        if (!this.mapa || this.mapa.puntos.length === 0) return 0;
        return (this.puntosVisitados() / this.mapa.puntos.length) * 100;
    }

    obtenerNombreEspiritu(nivel: CapaNivel | undefined): string {
        if (!nivel) return 'Espíritu Ancestral';

        const nombres: Record<CapaNivel, string> = {
            [CapaNivel.ACTUAL]: 'Guardián de Ingapirca',
            [CapaNivel.CANARI]: 'Amawta Cañari'
        };

        return nombres[nivel] || 'Espíritu Ancestral';
    }

    obtenerIconoCapa(nivel: CapaNivel | undefined): string {
        if (!nivel) return '📜';

        const iconos: Record<CapaNivel, string> = {
            [CapaNivel.ACTUAL]: '🏛️',
            [CapaNivel.CANARI]: '🌙'
        };

        return iconos[nivel] || '📜';
    }

    onImageError(event: any): void {
        event.target.src = 'https://upload.wikimedia.org/wikipedia/commons/0/03/Ecuador_ingapirca_inca_ruins.jpg';
    }

    protected mapearCoordenadasVisuales(punto: PuntoDTO): { x: number; y: number } {
        const coordenadasVisuales: Record<number, { x: number, y: number }> = {
            1: { x: 30, y: 35 },
            2: { x: 55, y: 25 },
            3: { x: 75, y: 45 }
        };

        return coordenadasVisuales[punto.id] || { x: 50, y: 35 };
    }

    generarCaminos(): void {
        if (!this.mapa || this.mapa.puntos.length === 0) {
            this.caminosSVG = [];
            return;
        }

        const caminos: string[] = [];
        const puntos = [...this.mapa.puntos].sort((a, b) => a.id - b.id);

        for (let i = 0; i < puntos.length - 1; i++) {
            const punto1 = puntos[i];
            const punto2 = puntos[i + 1];

            const coords1 = this.mapearCoordenadasVisuales(punto1);
            const coords2 = this.mapearCoordenadasVisuales(punto2);

            const x1 = coords1.x * 10;
            const y1 = coords1.y * 10;
            const x2 = coords2.x * 10;
            const y2 = coords2.y * 10;

            const seed = (punto1.id + punto2.id) * 0.123;
            const offsetX = Math.sin(seed) * 80;
            const offsetY = Math.cos(seed) * 80;

            const ctrlX = (x1 + x2) / 2 + offsetX;
            const ctrlY = (y1 + y2) / 2 + offsetY;

            caminos.push(`M ${x1},${y1} Q ${ctrlX},${ctrlY} ${x2},${y2}`);
        }

        this.caminosSVG = caminos;
    }

    // Método para reiniciar juego manualmente
    reiniciarJuego(): void {
        const confirmado = window.confirm(
            '¿Estás seguro de reiniciar el juego?\n\n' +
            'Se perderá todo el progreso actual.'
        );

        if (confirmado) {
            localStorage.removeItem(this.STORAGE_PARTIDA_ID);
            localStorage.removeItem(this.STORAGE_JUGADOR_ID);
            window.location.reload();
        }
    }
}
