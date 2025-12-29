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

import {
    CategoriasCultural,
    NivelDificultad,
    TarjetaMemoria,
    IniciarPartidaRequest,
    FinalizarPartidaRequest,
    ElementoCultural
} from '../../models/juego.model';
import { PartidaService } from '@/components/partida.service';

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
        Select
    ],
    selector: 'app-memoria-cultural',
    templateUrl: './memoria-cultural.component.html',
    styleUrls: ['./memoria-cultural.component.scss'],
    providers: [MessageService]
})
export class MemoriaCulturalComponent implements OnInit, OnDestroy {
    // Estado del juego
    tarjetas: TarjetaMemoria[] = [];
    tarjetasSeleccionadas: TarjetaMemoria[] = [];
    intentos = 0;
    parejasEncontradas = 0;
    tiempoInicio!: Date;
    tiempoTranscurrido = 0;
    juegoTerminado = false;
    juegoIniciado = false;
    interval: any;

    // Configuración
    categoriaSeleccionada: CategoriasCultural = CategoriasCultural.VESTIMENTA;
    nivelSeleccionado: NivelDificultad = NivelDificultad.FACIL;

    // Partida actual
    partidaId?: number;
    jugadorId: string = '';
    puntuacionFinal: number = 0;
    insigniasNuevas: any[] = [];

    // Opciones para selectores
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

    constructor(
        private partidaService: PartidaService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // Obtener o generar ID del jugador
        this.jugadorId = this.obtenerJugadorId();
    }

    /**
     * Obtiene o genera un ID único para el jugador
     */
    private obtenerJugadorId(): string {
        let id = localStorage.getItem('jugadorId');
        if (!id) {
            id = 'jugador_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('jugadorId', id);
        }
        return id;
    }

    /**
     * Inicia una nueva partida consultando al backend
     */
    iniciarJuego(): void {
        const request: IniciarPartidaRequest = {
            jugadorId: this.jugadorId,
            nivel: this.nivelSeleccionado,
            categoria: this.categoriaSeleccionada
        };

        this.partidaService.iniciarPartida(request).subscribe({
            next: (response) => {
                this.partidaId = response.partidaId;
                this.prepararTarjetas(response.elementos);
                this.resetearEstadoJuego();
                this.juegoIniciado = true;
                this.iniciarCronometro();

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Juego iniciado!',
                    detail: 'Encuentra todas las parejas'
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

    /**
     * Prepara las tarjetas del juego duplicando los elementos del backend
     */
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

        // Duplicar las tarjetas para crear parejas
        const tarjetasDuplicadas = tarjetasBase.map((tarjeta, index) => ({
            ...tarjeta,
            id: index * 2 + 1
        }));

        // Combinar y mezclar
        this.tarjetas = this.mezclarArray([...tarjetasBase, ...tarjetasDuplicadas]);
    }

    /**
     * Mezcla aleatoriamente un array
     */
    private mezclarArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Resetea el estado del juego
     */
    private resetearEstadoJuego(): void {
        this.intentos = 0;
        this.parejasEncontradas = 0;
        this.tiempoTranscurrido = 0;
        this.juegoTerminado = false;
        this.tarjetasSeleccionadas = [];
        this.puntuacionFinal = 0;
        this.insigniasNuevas = [];

        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    /**
     * Inicia el cronómetro
     */
    private iniciarCronometro(): void {
        this.tiempoInicio = new Date();
        this.interval = setInterval(() => {
            this.tiempoTranscurrido = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);
        }, 1000);
    }

    /**
     * Maneja el clic en una tarjeta
     */
    voltearTarjeta(tarjeta: TarjetaMemoria): void {
        // Validaciones
        if (!this.juegoIniciado || this.juegoTerminado) return;
        if (tarjeta.volteada || tarjeta.emparejada) return;
        if (this.tarjetasSeleccionadas.length >= 2) return;

        // Voltear tarjeta
        tarjeta.volteada = true;
        this.tarjetasSeleccionadas.push(tarjeta);

        // Si hay 2 tarjetas seleccionadas, verificar si coinciden
        if (this.tarjetasSeleccionadas.length === 2) {
            this.intentos++;
            this.verificarPareja();
        }
    }

    /**
     * Verifica si las dos tarjetas seleccionadas son una pareja
     */
    private verificarPareja(): void {
        const [tarjeta1, tarjeta2] = this.tarjetasSeleccionadas;

        // Comparar por elementoId pero asegurar que no sean la misma tarjeta
        if (tarjeta1.elementoId === tarjeta2.elementoId && tarjeta1.id !== tarjeta2.id) {
            // ¡Es una pareja!
            setTimeout(() => {
                tarjeta1.emparejada = true;
                tarjeta2.emparejada = true;
                this.parejasEncontradas++;
                this.tarjetasSeleccionadas = [];

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Pareja encontrada!',
                    detail: `${tarjeta1.nombreEspanol} - ${tarjeta1.nombreKichwa}`,
                    life: 2000
                });

                // Verificar si el juego está completo
                this.verificarJuegoCompleto();
            }, 500);
        } else {
            // No es pareja
            setTimeout(() => {
                tarjeta1.volteada = false;
                tarjeta2.volteada = false;
                this.tarjetasSeleccionadas = [];
            }, 1000);
        }
    }

    /**
     * Verifica si el juego está completo
     */
    private verificarJuegoCompleto(): void {
        const cantidadPares = this.getCantidadParesPorNivel();

        if (this.parejasEncontradas === cantidadPares) {
            this.finalizarJuego();
        }
    }

    /**
     * Finaliza el juego y envía los datos al backend
     */
    private finalizarJuego(): void {
        clearInterval(this.interval);
        this.juegoTerminado = true;

        if (!this.partidaId) return;

        const request: FinalizarPartidaRequest = {
            partidaId: this.partidaId,
            intentos: this.intentos,
            tiempoSegundos: this.tiempoTranscurrido
        };

        this.partidaService.finalizarPartida(request).subscribe({
            next: (response) => {
                this.puntuacionFinal = response.puntuacion;

                // Verificar si obtuvo insignia por juego perfecto
                if (this.intentos <= this.getCantidadParesPorNivel()) {
                    this.insigniasNuevas.push({
                        nombre: 'Memoria Perfecta',
                        nombreKichwa: 'Yuyarina Allilla',
                        icono: 'https://via.placeholder.com/100/DAA520/ffffff?text=🏆'
                    });
                }

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Juego completado!',
                    detail: `Puntuación: ${response.puntuacion}`,
                    life: 5000
                });
            },
            error: (error) => {
                console.error('Error al finalizar partida:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo guardar la partida'
                });
            }
        });
    }

    /**
     * Obtiene la cantidad de pares según el nivel
     */
    private getCantidadParesPorNivel(): number {
        switch (this.nivelSeleccionado) {
            case NivelDificultad.FACIL: return 6;
            case NivelDificultad.MEDIO: return 8;
            case NivelDificultad.DIFICIL: return 12;
            default: return 6;
        }
    }

    /**
     * Calcula la precisión del jugador
     */
    calcularPrecision(): number {
        const intentosMinimos = this.getCantidadParesPorNivel();
        return Math.round((intentosMinimos / this.intentos) * 100);
    }

    /**
     * Reinicia el juego
     */
    reiniciarJuego(): void {
        this.juegoIniciado = false;
        this.juegoTerminado = false;
        this.tarjetas = [];
        this.resetearEstadoJuego();
    }

    /**
     * Vuelve al menú principal
     */
    volverAlMenu(): void {
        this.reiniciarJuego();
    }

    /**
     * Obtiene la clase CSS para la grilla según el nivel
     */
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
    }
}
