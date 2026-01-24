// mapa-ingapirca.component.ts - FLUJO COMPLETO CON CAPAS

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

// Componentes

// Servicios
import { ExploracionService } from '@/services/exploracion_final.service';

// Modelos
import {
    PuntoInteresDTO,
    CapaPuntoDTO,
    NivelCapa,
    NivelDescubrimiento,
    CategoriaPunto
} from '../../models/explorasion.model';
import { CapasPuntoComponent } from '@/components/capas-punto.component';
import { FileSelectEvent, FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';

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
        CapasPuntoComponent,
        FileUpload
    ],
    providers: [MessageService],
    templateUrl: './mapa-ingapirca.component.html',
    styleUrls: ['./mapa-ingapirca.component.scss']
})
export class MapaIngapircaComponent implements OnInit, OnDestroy {
    @Input() puntoDestacado: number | null = null;
    @Input() modoVisita = false;
    @Input() puntosDisponibles: number[] = [];
    @Output() puntoVisitado = new EventEmitter<number>();

    // Estado del mapa
    puntos: PuntoInteresDTO[] = [];

    // MODAL 1: Capas del punto
    mostrarModalCapas = false;
    puntoSeleccionado: PuntoInteresDTO | null = null;
    capasPunto: CapaPuntoDTO[] = [];

    // MODAL 2: Exploración de capa
    mostrarModalExploracion = false;
    capaActiva: CapaPuntoDTO | null = null;
    tabActivo = 0;

    // Narrativa
    cargandoNarrativa = false;
    narrativaActual = '';
    narrativaVisible = '';
    narrativaCompleta = false;
    typingInterval: any;

    // Diálogo
    preguntaDialogo = '';

    // IDs
    partidaId = 1;
    usuarioId = 1;

    private destroy$ = new Subject<void>();

    // Enums para template
    NivelCapa = NivelCapa;
    NivelDescubrimiento = NivelDescubrimiento;
    CategoriaPunto = CategoriaPunto;

    constructor(
        private exploracionService: ExploracionService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.inicializar();
    }

    // ==================== INICIALIZACIÓN ====================

    inicializar(): void {
        this.exploracionService.inicializarExploracion(this.partidaId, this.usuarioId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.cargarPuntos();
                    if (this.puntoDestacado) {
                        setTimeout(() => {
                            this.seleccionarPuntoAutomaticamente(this.puntoDestacado!);
                        }, 500);
                    }
                },
                error: (error) => {
                    console.error('Error inicializando:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo inicializar la exploración'
                    });
                }
            });
    }

    cargarPuntos(): void {
        this.exploracionService.obtenerPuntosDisponibles(this.partidaId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (puntos) => {
                    this.puntos = puntos;
                    if (this.modoVisita && this.puntosDisponibles.length > 0) {
                        this.puntos.forEach(punto => {
                            punto.desbloqueado = this.puntosDisponibles.includes(punto.id);
                        });
                    }
                },
                error: (error) => {
                    console.error('Error cargando puntos:', error);
                }
            });
    }

    seleccionarPuntoAutomaticamente(puntoId: number): void {
        const punto = this.puntos.find(p => p.id === puntoId);
        if (punto && punto.desbloqueado) {
            this.seleccionarPunto(punto);
        }
    }

    // ==================== FLUJO: SELECCIONAR PUNTO → MODAL CAPAS ====================

    seleccionarPunto(punto: PuntoInteresDTO): void {
        if (!punto.desbloqueado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Punto Bloqueado',
                detail: 'Necesitas explorar más puntos para desbloquear este lugar'
            });
            return;
        }

        this.puntoSeleccionado = punto;
        this.mostrarModalCapas = true;

        // Cargar las 4 capas del punto
        this.exploracionService.obtenerCapasPunto(punto.id, this.partidaId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (capas) => {
                    this.capasPunto = capas;
                },
                error: (error) => {
                    console.error('Error cargando capas:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar las capas del punto'
                    });
                }
            });
    }

    cerrarModalCapas(): void {
        if (!this.mostrarModalExploracion) {
        this.puntoSeleccionado = null;
        this.capasPunto = [];
    }
    }

    // ==================== FLUJO: EXPLORAR CAPA → MODAL EXPLORACIÓN ====================

    abrirExploracionCapa(capa: CapaPuntoDTO): void {
        console.log('Explorando capa:', capa);

        // Descubrir/entrar a la capa en el backend
        this.exploracionService.descubrirCapaPunto({
            partidaId: this.partidaId,
            puntoId: this.puntoSeleccionado!.id,
            nivelCapa: capa.nivelCapa
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.exito) {
                        // Cerrar modal de capas
                        this.mostrarModalCapas = false;

                        // Abrir modal de exploración
                        this.capaActiva = response.capa;
                        this.mostrarModalExploracion = true;
                        this.tabActivo = 0; // Reset a tab de narrativa

                        // Cargar narrativa si es nueva
                        if (response.narrativaNueva || !response.capa.narrativaLeida) {
                            this.cargarNarrativa(response.capa);
                        }
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Error',
                            detail: response.mensaje
                        });
                    }
                },
                error: (error) => {
                    console.error('Error al entrar a capa:', error);
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
        this.tabActivo = 0;

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        // Reabrir modal de capas
        this.mostrarModalCapas = true;

        // Recargar capas para ver progreso actualizado
        if (this.puntoSeleccionado) {
            this.exploracionService.obtenerCapasPunto(this.puntoSeleccionado.id, this.partidaId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (capas) => {
                        this.capasPunto = capas;
                    }
                });
        }
    }

    cerrarModalExploracion(): void {
        this.mostrarModalExploracion = false;
        this.capaActiva = null;
        this.tabActivo = 0;

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        // Recargar puntos para actualizar progreso en el mapa
        this.cargarPuntos();
    }

    // ==================== NARRATIVA ====================

     cargarNarrativa(capa: CapaPuntoDTO): void {
        this.cargandoNarrativa = true;
        this.narrativaVisible = '';
        this.narrativaCompleta = false;

        // Simular carga (en producción viene del backend)
        setTimeout(() => {
            this.cargandoNarrativa = false;
            this.narrativaActual = capa.narrativaTexto || this.generarNarrativaFallback(capa);
            this.animarTexto(this.narrativaActual);
        }, 1500);
    }

    private generarNarrativaFallback(capa: CapaPuntoDTO): string {
        const nombrePunto = this.puntoSeleccionado?.nombre || 'este lugar';
        return `Has descubierto ${nombrePunto} en la capa ${capa.nombre}. ${capa.descripcion}`;
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
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.narrativaVisible = this.narrativaActual;
            this.narrativaCompleta = true;
        }
    }

    // ==================== DIÁLOGO ====================

    enviarPregunta(): void {


        console.log('🔍 DEBUG enviarPregunta:', {
                pregunta: this.preguntaDialogo,
                capaActiva: this.capaActiva,
                puntoSeleccionado: this.puntoSeleccionado
            });

// 1️⃣ CORRECCIÓN DEL CRASH:
        // Agregamos !this.puntoSeleccionado a la validación.
        // Si no hay punto seleccionado, no intentamos enviar nada.
        if (!this.preguntaDialogo.trim() || !this.capaActiva || !this.puntoSeleccionado) {
            console.warn("Faltan datos: No hay punto seleccionado o capa activa.");
            return;
        }
        this.exploracionService.dialogarConEspiritu({
            partidaId: this.partidaId,
            nivelCapa: this.capaActiva.nivelCapa,
            pregunta: this.preguntaDialogo,
            puntoInteresId: this.puntoSeleccionado!.id
        }).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.exito && response.respuestaEspiritu) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'this.capaActiva!.nombreEspiritu',
                            detail: response.respuestaEspiritu,
                            life: 10000
                        });

                        // Incrementar contador de diálogos
                        if (this.capaActiva) {
                            this.capaActiva.dialogosRealizados++;
                        }

                        this.preguntaDialogo = '';
                    }
                },
                error: (error) => {
                    console.error('Error en diálogo:', error);
                }
            });
    }

    // ==================== UTILIDADES ====================

    puntosVisitados(): number {
        return this.puntos.filter(p => p.visitado).length;
    }

    porcentajeVisitados(): number {
        if (this.puntos.length === 0) return 0;
        return (this.puntosVisitados() / this.puntos.length) * 100;
    }

    onImageError(event: any): void {
        event.target.src = 'https://upload.wikimedia.org/wikipedia/commons/0/03/Ecuador_ingapirca_inca_ruins.jpg';
    }

    obtenerColorNivel(nivel: NivelDescubrimiento | NivelCapa | null): string {
        if (!nivel) return '#999999';

        if (Object.values(NivelDescubrimiento).includes(nivel as any)) {
            const colores: Record<NivelDescubrimiento, string> = {
                [NivelDescubrimiento.NO_VISITADO]: '#999999',
                [NivelDescubrimiento.BRONCE]: '#CD7F32',
                [NivelDescubrimiento.PLATA]: '#C0C0C0',
                [NivelDescubrimiento.ORO]: '#FFD700'
            };
            return colores[nivel as NivelDescubrimiento];
        }

        return '#8B4513';
    }

    obtenerEmojiCategoria(categoria: CategoriaPunto): string {
        const emojis: Record<CategoriaPunto, string> = {
            [CategoriaPunto.TEMPLO]: '☀️',
            [CategoriaPunto.PLAZA]: '🗺️',
            [CategoriaPunto.VIVIENDA]: '🏠',
            [CategoriaPunto.DEPOSITO]: '📦',
            [CategoriaPunto.OBSERVATORIO]: '👁️',
            [CategoriaPunto.CEREMONIAL]: '💧',
            [CategoriaPunto.CAMINO]: '🛤️'
        };
        return emojis[categoria] || '✨';
    }

    obtenerIconoCapa(nivelCapa: NivelCapa): string {
        const iconos: Record<NivelCapa, string> = {
            [NivelCapa.SUPERFICIE]: '🏛️',
            [NivelCapa.INCA]: '☀️',
            [NivelCapa.CANARI]: '🌙',
            [NivelCapa.ANCESTRAL]: '⭐'
        };
        return iconos[nivelCapa] || '📜';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
    }

    cargandoFoto = false;

    subirFotografia(event: FileSelectEvent, objetivo: any): void {
        console.log('📸 Archivo seleccionado:', event.files[0]);

        // No hacer nada aquí, el procesamiento real ocurre en uploadHandler
        // Este método es solo informativo
    }

    procesarFotografia(event: FileUploadHandlerEvent, objetivo: any): void {
        if (!event.files || event.files.length === 0) {
            return;
        }

        const file = event.files[0];

        const objetivoRef = objetivo; // Guardar referencia

        console.log('📸 Procesando fotografía:', {
            nombre: file.name,
            tamaño: file.size,
            tipo: file.type,
            objetivo: objetivoRef // Verificar que existe
        });

        console.log('📸 Procesando fotografía:', {
            nombre: file.name,
            tamaño: file.size,
            tipo: file.type
        });

        // Validar tamaño (máximo 5MB)
        if (file.size > 5000000) {
            this.messageService.add({
                severity: 'error',
                summary: 'Archivo muy grande',
                detail: 'La imagen no debe superar 5MB'
            });
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            this.messageService.add({
                severity: 'error',
                summary: 'Formato inválido',
                detail: 'Solo se permiten archivos de imagen'
            });
            return;
        }

        this.cargandoFoto = true;

        // Convertir a Base64
        const reader = new FileReader();

        reader.onload = () => {
            const base64String = reader.result as string;

            // Enviar al backend
            this.capturarFotografia(objetivo, base64String);
        };

        reader.onerror = (error) => {
            console.error('Error leyendo archivo:', error);
            this.cargandoFoto = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo leer el archivo'
            });
        };

        reader.readAsDataURL(file);
    }

    private capturarFotografia(objetivo: any, imagenBase64: string): void {
        if (!this.capaActiva) {
            this.cargandoFoto = false;
            return;
        }

        // Preparar request
        const request = {
            partidaId: this.partidaId,
            objetivoId: objetivo.id,
            imagenBase64: imagenBase64,
            descripcionUsuario: null // Opcional: podrías pedir al usuario que describa la foto
        };

        console.log('📤 Enviando fotografía al backend...');

        this.exploracionService.capturarFotografia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.cargandoFoto = false;

                    if (response.exito) {
                        // Marcar objetivo como completado
                        objetivo.completada = true;

                        this.messageService.add({
                            severity: 'success',
                            summary: '📸 ¡Fotografía Capturada!',
                            detail: response.mensaje,
                            life: 5000
                        });

                        // Mostrar análisis de IA
                        if (response.analisisIA) {
                            setTimeout(() => {
                                this.messageService.add({
                                    severity: 'info',
                                    summary: '🤖 Análisis IA',
                                    detail: response.analisisIA.descripcionIA,
                                    life: 8000
                                });
                            }, 1000);
                        }

                        // Mostrar recompensas
                        if (response.recompensas && response.recompensas.length > 0) {
                            setTimeout(() => {
                                const recompensasTexto = response.recompensas
                                    .map(r => `${r.tipo}: +${r.cantidad}`)
                                    .join(', ');

                                this.messageService.add({
                                    severity: 'success',
                                    summary: '🎁 Recompensas',
                                    detail: recompensasTexto,
                                    life: 6000
                                });
                            }, 2000);
                        }

                        // Actualizar progreso de la capa
                        if (this.capaActiva) {
                            this.capaActiva.fotografiasCompletadas++;

                            // Verificar si completó todas las fotos
                            const todasCapturadas = this.capaActiva.fotografiasPendientes
                                .every(obj => obj.completada);

                            if (todasCapturadas) {
                                setTimeout(() => {
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: '✨ ¡Capa Completada!',
                                        detail: 'Has capturado todas las fotografías de esta capa',
                                        life: 5000
                                    });
                                }, 3000);
                            }
                        }

                    } else {
                        // Error: no cumple criterios
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Fotografía no válida',
                            detail: response.mensaje,
                            life: 5000
                        });

                        if (response.analisisIA) {
                            setTimeout(() => {
                                this.messageService.add({
                                    severity: 'info',
                                    summary: '💡 Sugerencia IA',
                                    detail: response.analisisIA.descripcionIA,
                                    life: 8000
                                });
                            }, 1000);
                        }
                    }
                },
                error: (error) => {
                    this.cargandoFoto = false;
                    console.error('❌ Error capturando fotografía:', error);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo procesar la fotografía. Intenta de nuevo.',
                        life: 5000
                    });
                }
            });
    }

    caminosSVG: string[] = [];



    // ⬇️ MÉTODO MEJORADO - Genera caminos consistentes
    generarCaminos(): string[] {
        if (!this.puntos || this.puntos.length === 0) return [];

        const caminos: string[] = [];
        const puntosOrdenados = [...this.puntos].sort((a, b) => a.id - b.id);

        // Conectar puntos consecutivos con curvas suaves
        for (let i = 0; i < puntosOrdenados.length - 1; i++) {
            const punto1 = puntosOrdenados[i];
            const punto2 = puntosOrdenados[i + 1];

            const x1 = punto1.coordenadaX * 10;
            const y1 = punto1.coordenadaY * 10;
            const x2 = punto2.coordenadaX * 10;
            const y2 = punto2.coordenadaY * 10;

            // ⬇️ PUNTO DE CONTROL BASADO EN POSICIÓN (consistente)
            // Usamos un hash simple basado en las coordenadas
            const seed = (punto1.id + punto2.id) * 0.123; // Seed consistente
            const offsetX = Math.sin(seed) * 80; // -80 a 80
            const offsetY = Math.cos(seed) * 80;

            const ctrlX = (x1 + x2) / 2 + offsetX;
            const ctrlY = (y1 + y2) / 2 + offsetY;

            caminos.push(`M ${x1},${y1} Q ${ctrlX},${ctrlY} ${x2},${y2}`);
        }

        return caminos;
    }

    // ⬇️ OPCIONAL: Método para generar caminos entre puntos específicos
    generarCaminosConectados(): string[] {
        if (!this.puntos || this.puntos.length < 2) return [];

        const caminos: string[] = [];

        // Definir conexiones específicas entre puntos
        const conexiones = this.obtenerConexionesPuntos();

        conexiones.forEach(conexion => {
            const punto1 = this.puntos.find(p => p.id === conexion.desde);
            const punto2 = this.puntos.find(p => p.id === conexion.hasta);

            if (punto1 && punto2) {
                const x1 = punto1.coordenadaX * 10;
                const y1 = punto1.coordenadaY * 10;
                const x2 = punto2.coordenadaX * 10;
                const y2 = punto2.coordenadaY * 10;

                // Curvatura basada en la distancia
                const distancia = Math.hypot(x2 - x1, y2 - y1);
                const curvatura = distancia * 0.3; // 30% de la distancia

                // Calcular punto de control perpendicular
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const dx = x2 - x1;
                const dy = y2 - y1;

                // Perpendicular
                const perpX = -dy / distancia * curvatura;
                const perpY = dx / distancia * curvatura;

                const ctrlX = midX + perpX;
                const ctrlY = midY + perpY;

                caminos.push(`M ${x1},${y1} Q ${ctrlX},${ctrlY} ${x2},${y2}`);
            }
        });

        return caminos;
    }

    // ⬇️ Define qué puntos conectar (ajusta según tu lógica)
    private obtenerConexionesPuntos(): Array<{desde: number, hasta: number}> {
        // Si tus puntos tienen un orden lógico, conéctalos en secuencia
        const conexiones: Array<{desde: number, hasta: number}> = [];

        const puntosOrdenados = [...this.puntos]
            .filter(p => p.desbloqueado)
            .sort((a, b) => a.id - b.id);

        for (let i = 0; i < puntosOrdenados.length - 1; i++) {
            conexiones.push({
                desde: puntosOrdenados[i].id,
                hasta: puntosOrdenados[i + 1].id
            });
        }

        return conexiones;
    }

}
