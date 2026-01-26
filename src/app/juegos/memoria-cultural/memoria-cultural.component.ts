// src/app/components/memoria-cultural/memoria-cultural.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';

import {
    CategoriasCultural,
    NivelDificultad,
    TarjetaMemoria,
    IniciarPartidaRequest,
    FinalizarPartidaRequest,
    ElementoCultural,
    EstadoPartida,
    NarrativaEducativa,
    DialogoCultural,
    TipoHint,
    Insignia
} from '@/models/juego.model';
import { PartidaService } from '@/components/partida.service';

// ⬇️ NUEVO: Importar servicio para guardar estadísticas
import { PartidaService as GuardarPartidaService, GuardarPartidaRequest } from '@/services/partida.service';
import { SesionService } from '@/services/sesion.service';

@Component({
    standalone: true,
    imports: [
        ButtonModule,
        ToastModule,
        DividerModule,
        DialogModule,
        CommonModule,
        SelectButtonModule,
        FormsModule,
        CardModule,
        Select,
        ProgressBarModule,
        BadgeModule
    ],
    selector: 'app-memoria-cultural',
    templateUrl: './memoria-cultural.component.html',
    styleUrls: ['./memoria-cultural.component.scss'],
    providers: [MessageService]
})
export class MemoriaCulturalComponent implements OnInit, OnDestroy {
    // ==================== ESTADO DEL JUEGO ====================
    tarjetas: TarjetaMemoria[] = [];
    tarjetasSeleccionadas: TarjetaMemoria[] = [];
    intentos = 0;
    parejasEncontradas = 0;
    tiempoInicio!: Date;
    tiempoTranscurrido = 0;
    juegoTerminado = false;
    juegoIniciado = false;
    interval: any;
    juegoGameOver = false;
    cargandoJuego = false;

    // Tracking de la partida
    puntuacion = 0;
    juegoCompletado = false;

    // ==================== CONFIGURACIÓN ====================
    categoriaSeleccionada: CategoriasCultural = CategoriasCultural.VESTIMENTA;
    nivelSeleccionado: NivelDificultad = NivelDificultad.FACIL;
    partidaId?: number;
    jugadorId: string = '';

    // ==================== GAMIFICACIÓN ====================
    estadoPartida!: EstadoPartida;

    // Vidas
    vidasArray: boolean[] = [];

    // Combos
    mostrarCombo = false;
    animacionCombo = '';

    // Hints
    mostrarDialogoHint = false;
    hintMensaje = '';

    // Narrativa Educativa
    mostrarNarrativaEducativa = false;
    narrativaActual?: NarrativaEducativa;
    elementoActual?: TarjetaMemoria;

    // Diálogo Cultural
    mostrarDialogoCultural = false;
    dialogoActual?: DialogoCultural;

    // Responder Pregunta
    mostrarPregunta = false;
    preguntaSeleccionada = -1;

    // Resultados
    puntuacionFinal = 0;
    insigniasNuevas: Insignia[] = [];
    estadisticasFinales?: any;

    // ==================== OPCIONES ====================
    categoriasDisponibles = [
        { label: 'Vestimenta', value: CategoriasCultural.VESTIMENTA },
        { label: 'Música', value: CategoriasCultural.MUSICA },
        { label: 'Lugares', value: CategoriasCultural.LUGARES },
        { label: 'Festividades', value: CategoriasCultural.FESTIVIDADES }
    ];

    nivelesDisponibles = [
        { label: 'Fácil (6 pares)', value: NivelDificultad.FACIL },
        { label: 'Medio (8 pares)', value: NivelDificultad.MEDIO },
        { label: 'Difícil (12 pares)', value: NivelDificultad.DIFICIL }
    ];

    debesMostrarPreguntaDespues = false;

    constructor(
        private partidaService: PartidaService,
        private messageService: MessageService,
        // ⬇️ NUEVO: Inyectar servicios para guardar estadísticas
        private guardarPartidaService: GuardarPartidaService,
        private sesionService: SesionService
    ) {}

    ngOnInit(): void {
        this.jugadorId = this.obtenerJugadorId();
        console.log('🎮 Componente de Memoria Cultural iniciado');
        console.log('👤 Jugador ID:', this.jugadorId);
    }

    // ==================== INICIALIZACIÓN ====================

    private obtenerJugadorId(): string {
        // Primero intentar obtener del servicio de sesión
        const usuario = this.sesionService.getUsuario();
        if (usuario) {
            console.log('👤 Usuario de sesión:', usuario);
            return usuario.id.toString();
        }

        // Fallback al método anterior
        let id = localStorage.getItem('jugadorId');
        if (!id) {
            id = 'jugador_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('jugadorId', id);
        }
        return id;
    }

    iniciarJuego(): void {
        this.cargandoJuego = true; // ← Activar loading

        const request: IniciarPartidaRequest = {
            jugadorId: this.jugadorId,
            nivel: this.nivelSeleccionado,
            categoria: this.categoriaSeleccionada
        };

        this.partidaService.iniciarPartida(request).subscribe({
            next: (response) => {
                this.partidaId = response.partidaId;
                this.estadoPartida = response.estadoInicial;
                this.actualizarVidasArray();

                this.prepararTarjetas(response.elementos);
                this.resetearEstadoJuego();
                this.juegoIniciado = true;
                this.iniciarCronometro();
                this.cargandoJuego = false; // ← Desactivar loading

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Juego iniciado!',
                    detail: 'Encuentra todas las parejas',
                    life: 2000
                });
            },
            error: (error) => {
                console.error('Error al iniciar partida:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'No se pudo iniciar la partida'
                });
            }
        });
    }

    private prepararTarjetas(elementos: ElementoCultural[]): void {
        const tarjetasBase: TarjetaMemoria[] = elementos.map((elemento, index) => ({
            id: index * 2,
            elementoId: elemento.id,
            imagen: elemento.imagenUrl,
            nombreKichwa: elemento.nombreKichwa,
            nombreEspanol: elemento.nombreEspanol,
            categoria: elemento.categoria,
            volteada: false,
            emparejada: false
        }));

        const tarjetasDuplicadas = tarjetasBase.map((tarjeta, index) => ({
            ...tarjeta,
            id: index * 2 + 1
        }));

        this.tarjetas = this.mezclarArray([...tarjetasBase, ...tarjetasDuplicadas]);
    }

    private mezclarArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private resetearEstadoJuego(): void {
        this.intentos = 0;
        this.parejasEncontradas = 0;
        this.tiempoTranscurrido = 0;
        this.juegoTerminado = false;
        this.tarjetasSeleccionadas = [];
        this.puntuacionFinal = 0;
        this.insigniasNuevas = [];
        this.mostrarCombo = false;
        this.puntuacion = 0; // ⬇️ Resetear puntuación

        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    private iniciarCronometro(): void {
        this.tiempoInicio = new Date();
        this.interval = setInterval(() => {
            this.tiempoTranscurrido = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);
        }, 1000);
    }

    // ==================== LÓGICA DEL JUEGO ====================

    voltearTarjeta(tarjeta: TarjetaMemoria): void {
        if (!this.juegoIniciado || this.juegoTerminado) return;
        if (tarjeta.volteada || tarjeta.emparejada) return;
        if (this.tarjetasSeleccionadas.length >= 2) return;

        tarjeta.volteada = true;
        this.tarjetasSeleccionadas.push(tarjeta);

        if (this.tarjetasSeleccionadas.length === 2) {
            this.intentos++;
            this.verificarPareja();
        }
    }

    private verificarPareja(): void {
        const [tarjeta1, tarjeta2] = this.tarjetasSeleccionadas;

        if (tarjeta1.elementoId === tarjeta2.elementoId && tarjeta1.id !== tarjeta2.id) {
            // ¡PAREJA CORRECTA!
            this.procesarParejaCorrecta(tarjeta1);
            this.puntuacion += this.calcularPuntos();
        } else {
            // ERROR
            this.procesarError(tarjeta1);
        }
    }

    calcularPuntos(): number {
        let puntosBase = 10;

        switch (this.nivelSeleccionado) {
            case NivelDificultad.FACIL:
                puntosBase = 10;
                break;
            case NivelDificultad.MEDIO:
                puntosBase = 20;
                break;
            case NivelDificultad.DIFICIL:
                puntosBase = 30;
                break;
        }

        return puntosBase;
    }

    private procesarParejaCorrecta(tarjeta: TarjetaMemoria): void {
        if (!this.partidaId) return;

        this.partidaService.procesarParejaCorrecta(this.partidaId, {
            partidaId: this.partidaId,
            elementoId: tarjeta.elementoId
        }).subscribe({
            next: (response) => {
                setTimeout(() => {
                    const [t1, t2] = this.tarjetasSeleccionadas;
                    t1.emparejada = true;
                    t2.emparejada = true;
                    this.parejasEncontradas++;
                    this.tarjetasSeleccionadas = [];

                    // Actualizar estado
                    this.estadoPartida = response.estadoActualizado;
                    this.actualizarVidasArray();

                    // Mostrar combo si está activo
                    if (response.estadoActualizado.combo.comboActivo) {
                        this.mostrarAnimacionCombo(response.comboActual, response.multiplicador);
                    }

                    // Mostrar diálogo cultural si es primer descubrimiento
                    if (response.dialogo && response.esPrimerDescubrimiento) {
                        this.mostrarDialogoCulturalToast(response.dialogo);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Pareja encontrada!',
                        detail: `${t1.nombreEspanol} - ${t1.nombreKichwa}`,
                        life: 2000
                    });

                    this.verificarJuegoCompleto();
                }, 500);
            },
            error: (error) => {
                console.error('Error al procesar pareja:', error);
            }
        });
    }

    private procesarError(tarjeta: TarjetaMemoria): void {
        if (!this.partidaId) return;

        this.partidaService.procesarError(this.partidaId, {
            partidaId: this.partidaId,
            elementoId: tarjeta.elementoId
        }).subscribe({
            next: (response) => {
                // Actualizar estado
                this.estadoPartida = response.estadoActualizado;
                this.actualizarVidasArray();

                if (response.comboRoto) {
                    this.mostrarCombo = false;
                }

                if (response.vidasRestantes === 0) {
                    this.manejarGameOver();
                    return;
                }

                setTimeout(() => {
                    this.tarjetasSeleccionadas.forEach(t => t.volteada = false);
                    this.tarjetasSeleccionadas = [];

                    // Mostrar narrativa
                    this.narrativaActual = response.narrativa;
                    this.elementoActual = tarjeta;
                    this.mostrarNarrativaEducativa = true;

                    this.debesMostrarPreguntaDespues = response.mostrarPregunta;
                }, 1000);
            },
            error: (error) => {
                console.error('Error al procesar error:', error);
                setTimeout(() => {
                    this.tarjetasSeleccionadas.forEach(t => t.volteada = false);
                    this.tarjetasSeleccionadas = [];
                }, 1000);
            }
        });
    }

    // ⬇️ MODIFICADO: Guardar partida incompleta en Game Over
    private manejarGameOver(): void {
        console.log('💀 GAME OVER - Sin vidas');

        // Detener cronómetro
        clearInterval(this.interval);

        // Desvoltear tarjetas después de un momento
        setTimeout(() => {
            this.tarjetasSeleccionadas.forEach(t => t.volteada = false);
            this.tarjetasSeleccionadas = [];

            // ⬇️ NUEVO: Guardar partida incompleta
            this.guardarPartidaIncompleta();

            // Mostrar diálogo de Game Over
            this.juegoGameOver = true;
        }, 1500);
    }

    // ⬇️ NUEVO MÉTODO: Guardar partida incompleta
    private guardarPartidaIncompleta(): void {
        console.log('💾 Guardando partida incompleta (Game Over)');

        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            console.warn('⚠️ No hay usuario en sesión, no se puede guardar');
            return;
        }

        const tiempoSegundos = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);

        const datosPartida: GuardarPartidaRequest = {
            jugadorId: usuario.id.toString(),
            nivel: this.nivelSeleccionado,
            categoria: this.categoriaSeleccionada,
            puntuacion: this.puntuacion,
            intentos: this.intentos,
            tiempoSegundos: tiempoSegundos,
            completada: false // ⬅️ IMPORTANTE: marcar como incompleta
        };

        console.log('📋 Datos de partida incompleta:', datosPartida);

        this.guardarPartidaService.guardarPartida(datosPartida).subscribe({
            next: (response) => {
                console.log('✅ Partida incompleta guardada:', response);
            },
            error: (error) => {
                console.error('❌ Error al guardar partida incompleta:', error);
            }
        });
    }

    reiniciarDespuesGameOver(): void {
        this.juegoGameOver = false;
        this.juegoIniciado = false;
        this.juegoTerminado = false;
        this.tarjetas = [];
        this.resetearEstadoJuego();
    }

    // ==================== GAMIFICACIÓN: HINTS ====================

    solicitarHint(): void {
        if (!this.partidaId) return;
        if (this.estadoPartida.hints.usosRestantes <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin pistas',
                detail: 'Ya no te quedan pistas disponibles'
            });
            return;
        }

        this.partidaService.solicitarHint(this.partidaId, {
            partidaId: this.partidaId,
            tipoHint: TipoHint.DESCRIPCION_CONTEXTUAL
        }).subscribe({
            next: (response) => {
                this.estadoPartida = response.estadoActualizado;
                this.hintMensaje = response.mensaje;
                this.mostrarDialogoHint = true;

                this.messageService.add({
                    severity: 'info',
                    summary: `Pista (-${response.costoPuntos} pts)`,
                    detail: `Te quedan ${response.usosRestantes} pistas`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('Error al solicitar hint:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo obtener la pista'
                });
            }
        });
    }

    cerrarDialogoHint(): void {
        this.mostrarDialogoHint = false;
    }

    // ==================== GAMIFICACIÓN: NARRATIVA EDUCATIVA ====================

    cerrarNarrativa(): void {
        this.mostrarNarrativaEducativa = false;

        if (this.debesMostrarPreguntaDespues &&
            this.narrativaActual?.preguntaRecuperacion &&
            this.estadoPartida.vidas.vidasActuales < 3) {
            this.mostrarPregunta = true;
            this.preguntaSeleccionada = -1;
        }

        this.debesMostrarPreguntaDespues = false;
    }

    responderPregunta(indice: number): void {
        if (!this.partidaId || !this.elementoActual) return;

        this.partidaService.responderPregunta(this.partidaId, {
            partidaId: this.partidaId,
            elementoId: this.elementoActual.elementoId,
            respuestaSeleccionada: indice
        }).subscribe({
            next: (response) => {
                this.estadoPartida = response.estadoActualizado;
                this.actualizarVidasArray();

                if (response.esCorrecta) {
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Correcto! ❤️',
                        detail: 'Has recuperado 1 vida',
                        life: 3000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Incorrecto',
                        detail: response.explicacion,
                        life: 4000
                    });
                }

                this.mostrarPregunta = false;
            },
            error: (error) => {
                console.error('Error al responder pregunta:', error);
            }
        });
    }

    // ==================== GAMIFICACIÓN: COMBOS ====================

    private mostrarAnimacionCombo(parejas: number, multiplicador: number): void {
        this.mostrarCombo = true;

        if (parejas >= 5) {
            this.animacionCombo = 'super-combo';
        } else if (parejas >= 3) {
            this.animacionCombo = 'gran-combo';
        } else {
            this.animacionCombo = 'combo';
        }

        setTimeout(() => {
            this.mostrarCombo = false;
        }, 2000);
    }

    private mostrarDialogoCulturalToast(dialogo: DialogoCultural): void {
        this.messageService.add({
            severity: 'info',
            summary: dialogo.textoKichwa,
            detail: dialogo.textoEspanol,
            life: 3000,
            styleClass: 'dialogo-cultural-toast'
        });
    }

    // ==================== FINALIZAR JUEGO ====================

    private verificarJuegoCompleto(): void {
        const cantidadPares = this.getCantidadParesPorNivel();

        if (this.parejasEncontradas === cantidadPares) {
            this.finalizarJuego();
        }
    }

    // ⬇️ MODIFICADO: Guardar en estadísticas después de finalizar
    private finalizarJuego(): void {
        clearInterval(this.interval);
        this.juegoTerminado = true;
        this.juegoCompletado = true; // ⬅️ Marcar como completado

        if (!this.partidaId) return;

        const request: FinalizarPartidaRequest = {
            partidaId: this.partidaId,
            intentos: this.intentos,
            tiempoSegundos: this.tiempoTranscurrido
        };

        console.log('🏁 Finalizando juego con request:', request);

        this.partidaService.finalizarPartida(request).subscribe({
            next: (response) => {
                console.log('✅ Partida finalizada, respuesta del backend:', response);

                this.puntuacionFinal = response.puntuacion;
                this.insigniasNuevas = response.insignias;
                this.estadisticasFinales = response.estadisticas;

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Juego completado!',
                    detail: `Puntuación: ${response.puntuacion}`,
                    life: 5000
                });

                // ⬇️ NUEVO: Guardar en estadísticas
                this.guardarPartidaCompletada(response.puntuacion);
            },
            error: (error) => {
                console.error('❌ Error al finalizar partida:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo guardar la partida'
                });
            }
        });
    }

    // ⬇️ NUEVO MÉTODO: Guardar partida completada
    private guardarPartidaCompletada(puntuacionFinal: number): void {
        console.log('💾 Guardando partida completada en estadísticas');

        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            console.warn('⚠️ No hay usuario en sesión, no se puede guardar');
            return;
        }

        const tiempoSegundos = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);

        const datosPartida: GuardarPartidaRequest = {
            jugadorId: usuario.id.toString(),
            nivel: this.nivelSeleccionado,
            categoria: this.categoriaSeleccionada,
            puntuacion: puntuacionFinal, // Usar la puntuación final del backend
            intentos: this.intentos,
            tiempoSegundos: tiempoSegundos,
            completada: true // ⬅️ IMPORTANTE: marcar como completada
        };

        console.log('📋 Datos de partida completada:', datosPartida);

        this.guardarPartidaService.guardarPartida(datosPartida).subscribe({
            next: (response) => {
                console.log('✅ Partida completada guardada en estadísticas:', response);
                console.log('🎉 Ahora las estadísticas deberían mostrar esta partida!');

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Partida guardada!',
                    detail: 'Puedes ver tus estadísticas en el dashboard',
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ Error al guardar partida en estadísticas:', error);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'La partida se completó pero no se guardó en estadísticas',
                    life: 4000
                });
            }
        });
    }

    // ==================== HELPERS ====================

    private actualizarVidasArray(): void {
        if (!this.estadoPartida || !this.estadoPartida.vidas) {
            this.vidasArray = []; // ← Dejar vacío si no hay estado
            return;
        }

        this.vidasArray = Array(this.estadoPartida.vidas.vidasMaximas)
            .fill(false)
            .map((_, i) => i < this.estadoPartida.vidas.vidasActuales);
    }

    obtenerIconoCombo(): string {
        const parejas = this.estadoPartida?.combo.parejasConsecutivas || 0;
        if (parejas >= 5) return '🔥🔥🔥';
        if (parejas >= 3) return '🔥🔥';
        return '🔥';
    }

    obtenerTextoCombo(): string {
        const parejas = this.estadoPartida?.combo.parejasConsecutivas || 0;
        if (parejas >= 5) return '¡SUPER COMBO!';
        if (parejas >= 3) return '¡GRAN COMBO!';
        return '¡COMBO!';
    }

    private getCantidadParesPorNivel(): number {
        switch (this.nivelSeleccionado) {
            case NivelDificultad.FACIL: return 6;
            case NivelDificultad.MEDIO: return 8;
            case NivelDificultad.DIFICIL: return 12;
            default: return 6;
        }
    }

    calcularPrecision(): number {
        if (!this.estadisticasFinales) {
            const intentosMinimos = this.getCantidadParesPorNivel();
            return Math.round((intentosMinimos / this.intentos) * 100);
        }
        return Math.round(this.estadisticasFinales.precision);
    }

    reiniciarJuego(): void {
        this.juegoIniciado = false;
        this.juegoTerminado = false;
        this.juegoCompletado = false;
        this.tarjetas = [];
        this.resetearEstadoJuego();
    }

    volverAlMenu(): void {
        this.reiniciarJuego();
    }

    getGridClass(): string {
        switch (this.nivelSeleccionado) {
            case NivelDificultad.FACIL: return 'grid-facil';
            case NivelDificultad.MEDIO: return 'grid-medio';
            case NivelDificultad.DIFICIL: return 'grid-dificil';
            default: return 'grid-facil';
        }
    }

    ngOnDestroy(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }

        // ⬇️ NUEVO: Guardar partida incompleta si abandonó el juego
        if (this.juegoIniciado && !this.juegoTerminado && !this.juegoGameOver && this.intentos > 0) {
            console.log('⚠️ Jugador abandonó la partida, guardando como incompleta');
            this.guardarPartidaIncompleta();
        }
    }
}
