import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoriasCultural } from '@/models/juego.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';

interface TarjetaMemoria {
    id: number;
    idUnico: string; // Para identificar pares
    imagen: string;
    nombreKichwa: string;
    nombreEspanol: string;
    categoria: CategoriasCultural;
    volteada: boolean;
    emparejada: boolean;
}

@Component({
    standalone: true,
    imports: [ButtonModule, ToastModule, DividerModule, DialogModule, CommonModule, SelectButtonModule, FormsModule, CardModule, Select],
    selector: 'app-memoria-cultural',
    templateUrl: './memoria-cultural.component.html',
    styleUrls: ['./memoria-cultural.component.scss'],
    providers: [MessageService]
})
export class MemoriaCulturalComponent implements OnInit, OnDestroy {
    tarjetas: TarjetaMemoria[] = [];
    tarjetasSeleccionadas: TarjetaMemoria[] = [];
    intentos = 0;
    parejasEncontradas = 0;
    tiempoInicio!: Date;
    tiempoTranscurrido = 0;
    juegoTerminado = false;
    interval: any;

    categoriaSeleccionada: CategoriasCultural = CategoriasCultural.VESTIMENTA;
    dificultad: 'facil' | 'medio' | 'dificil' = 'facil';

    insigniasNuevas: any[] = [];
    puntuacionFinal: number = 0;

    categoriasDisponibles = [
        { label: 'Vestimenta', value: CategoriasCultural.VESTIMENTA },
        { label: 'Música', value: CategoriasCultural.MUSICA },
        { label: 'Lugares', value: CategoriasCultural.LUGARES },
        { label: 'Festividades', value: CategoriasCultural.FESTIVIDADES }
    ];

    opcionesDificultad = [
        { label: 'Fácil', value: 'facil' },
        { label: 'Medio', value: 'medio' },
        { label: 'Difícil', value: 'dificil' }
    ];

    constructor(private messageService: MessageService) {}

    ngOnInit(): void {
        this.inicializarJuego();
    }

    inicializarJuego(): void {
        this.tarjetas = [];
        this.tarjetasSeleccionadas = [];
        this.intentos = 0;
        this.parejasEncontradas = 0;
        this.tiempoTranscurrido = 0;
        this.juegoTerminado = false;
        this.puntuacionFinal = 0;
        this.insigniasNuevas = [];

        if (this.interval) {
            clearInterval(this.interval);
        }

        this.cargarTarjetas();
        this.barajarTarjetas();
        this.tiempoInicio = new Date();
        this.iniciarCronometro();
    }

    private cargarTarjetas(): void {
        const numPares = this.dificultad === 'facil' ? 6 : this.dificultad === 'medio' ? 8 : 12;

        const imagenesBase = this.obtenerImagenesPorCategoria(this.categoriaSeleccionada);
        const imagenesSeleccionadas = imagenesBase.slice(0, numPares);

        this.tarjetas = [];
        imagenesSeleccionadas.forEach((img, index) => {
            // Primera carta del par
            this.tarjetas.push({
                id: index * 2,
                idUnico: img.idUnico,
                imagen: img.imagen,
                nombreKichwa: img.nombreKichwa,
                nombreEspanol: img.nombreEspanol,
                categoria: img.categoria,
                volteada: false,
                emparejada: false
            });
            // Segunda carta del par
            this.tarjetas.push({
                id: index * 2 + 1,
                idUnico: img.idUnico,
                imagen: img.imagen,
                nombreKichwa: img.nombreKichwa,
                nombreEspanol: img.nombreEspanol,
                categoria: img.categoria,
                volteada: false,
                emparejada: false
            });
        });
    }

    private barajarTarjetas(): void {
        for (let i = this.tarjetas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tarjetas[i], this.tarjetas[j]] = [this.tarjetas[j], this.tarjetas[i]];
        }
    }

    voltearTarjeta(tarjeta: TarjetaMemoria): void {
        if (this.tarjetasSeleccionadas.length >= 2 || tarjeta.volteada || tarjeta.emparejada) {
            return;
        }

        tarjeta.volteada = true;
        this.tarjetasSeleccionadas.push(tarjeta);

        if (this.tarjetasSeleccionadas.length === 2) {
            this.intentos++;
            this.verificarPareja();
        }
    }

    private verificarPareja(): void {
        const [tarjeta1, tarjeta2] = this.tarjetasSeleccionadas;

        // Comparar por idUnico pero asegurar que no sean la misma tarjeta
        if (tarjeta1.idUnico === tarjeta2.idUnico && tarjeta1.id !== tarjeta2.id) {
            setTimeout(() => {
                tarjeta1.emparejada = true;
                tarjeta2.emparejada = true;
                this.parejasEncontradas++;
                this.tarjetasSeleccionadas = [];

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Allí!',
                    detail: `${tarjeta1.nombreKichwa} - ${tarjeta1.nombreEspanol}`,
                    life: 3000
                });

                if (this.parejasEncontradas === this.tarjetas.length / 2) {
                    this.finalizarJuego();
                }
            }, 500);
        } else {
            setTimeout(() => {
                tarjeta1.volteada = false;
                tarjeta2.volteada = false;
                this.tarjetasSeleccionadas = [];
            }, 1000);
        }
    }

    private finalizarJuego(): void {
        clearInterval(this.interval);
        this.juegoTerminado = true;
        this.puntuacionFinal = this.calcularPuntuacion();

        if (this.intentos <= 10) {
            this.insigniasNuevas.push({
                nombre: 'Memoria Perfecta',
                nombreKichwa: 'Yuyarina Allilla',
                icono: 'https://via.placeholder.com/100/DAA520/ffffff?text=🏆'
            });
        }

        this.messageService.add({
            severity: 'success',
            summary: '¡Juego Completado!',
            detail: `Puntuación: ${this.puntuacionFinal}`,
            life: 5000
        });
    }

    private calcularPuntuacion(): number {
        const multiplicadorDificultad = this.dificultad === 'facil' ? 1 : this.dificultad === 'medio' ? 1.5 : 2;
        const puntosTiempo = Math.max(0, 300 - this.tiempoTranscurrido);
        const puntosIntentos = Math.max(0, 100 - this.intentos * 5);
        return Math.round((puntosTiempo + puntosIntentos) * multiplicadorDificultad);
    }

    calcularPrecision(): number {
        const parejasEsperadas = this.tarjetas.length / 2;
        const intentosIdeales = parejasEsperadas;
        const precision = (intentosIdeales / this.intentos) * 100;
        return Math.min(100, Math.round(precision));
    }

    private iniciarCronometro(): void {
        this.interval = setInterval(() => {
            this.tiempoTranscurrido = Math.floor((new Date().getTime() - this.tiempoInicio.getTime()) / 1000);
        }, 1000);
    }

    reiniciarJuego(): void {
        this.inicializarJuego();
    }

    volverAlMenu(): void {
        console.log('Volver al menú principal');
    }

    ngOnDestroy(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    private obtenerImagenesPorCategoria(categoria: CategoriasCultural): any[] {
        const imagenesDB: Record<CategoriasCultural, any[]> = {
            [CategoriasCultural.VESTIMENTA]: [
                { idUnico: 'vest-1', imagen: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400', nombreKichwa: 'Punchukuna', nombreEspanol: 'Poncho', categoria: CategoriasCultural.VESTIMENTA },
                { idUnico: 'vest-2', imagen: 'https://images.unsplash.com/photo-1533055640609-24b498dfd74c?w=400', nombreKichwa: 'Sombrero', nombreEspanol: 'Sombrero', categoria: CategoriasCultural.VESTIMENTA },
                { idUnico: 'vest-3', imagen: 'https://images.unsplash.com/photo-1558769132-cb1aea1f9565?w=400', nombreKichwa: 'Chumbi', nombreEspanol: 'Faja', categoria: CategoriasCultural.VESTIMENTA },
                { idUnico: 'vest-4', imagen: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400', nombreKichwa: 'Pacha', nombreEspanol: 'Bayeta', categoria: CategoriasCultural.VESTIMENTA },
                { idUnico: 'vest-5', imagen: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400', nombreKichwa: 'Ushuta', nombreEspanol: 'Alpargatas', categoria: CategoriasCultural.VESTIMENTA },
                { idUnico: 'vest-6', imagen: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400', nombreKichwa: 'Makiwatana', nombreEspanol: 'Pulsera', categoria: CategoriasCultural.VESTIMENTA }
            ],
            [CategoriasCultural.MUSICA]: [
                { idUnico: 'mus-1', imagen: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400', nombreKichwa: 'Pinkuyllu', nombreEspanol: 'Pingullo', categoria: CategoriasCultural.MUSICA },
                { idUnico: 'mus-2', imagen: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400', nombreKichwa: 'Wankar', nombreEspanol: 'Tambor', categoria: CategoriasCultural.MUSICA },
                { idUnico: 'mus-3', imagen: 'https://images.unsplash.com/photo-1460667262436-cf19894f4774?w=400', nombreKichwa: 'Runa Tinya', nombreEspanol: 'Caja', categoria: CategoriasCultural.MUSICA },
                { idUnico: 'mus-4', imagen: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400', nombreKichwa: 'Antara', nombreEspanol: 'Zampoña', categoria: CategoriasCultural.MUSICA },
                { idUnico: 'mus-5', imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', nombreKichwa: 'Charango', nombreEspanol: 'Charango', categoria: CategoriasCultural.MUSICA },
                { idUnico: 'mus-6', imagen: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', nombreKichwa: 'Kena', nombreEspanol: 'Quena', categoria: CategoriasCultural.MUSICA }
            ],
            [CategoriasCultural.LUGARES]: [
                { idUnico: 'lug-1', imagen: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400', nombreKichwa: 'Ingapirka', nombreEspanol: 'Ingapirca', categoria: CategoriasCultural.LUGARES },
                { idUnico: 'lug-2', imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', nombreKichwa: 'Urku', nombreEspanol: 'Montaña Sagrada', categoria: CategoriasCultural.LUGARES },
                { idUnico: 'lug-3', imagen: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400', nombreKichwa: 'Yaku', nombreEspanol: 'Laguna', categoria: CategoriasCultural.LUGARES },
                { idUnico: 'lug-4', imagen: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400', nombreKichwa: 'Pukara', nombreEspanol: 'Fortaleza', categoria: CategoriasCultural.LUGARES },
                { idUnico: 'lug-5', imagen: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400', nombreKichwa: 'Chakra', nombreEspanol: 'Terraza Agrícola', categoria: CategoriasCultural.LUGARES },
                { idUnico: 'lug-6', imagen: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400', nombreKichwa: 'Ñan', nombreEspanol: 'Camino Inca', categoria: CategoriasCultural.LUGARES }
            ],
            [CategoriasCultural.FESTIVIDADES]: [
                { idUnico: 'fest-1', imagen: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400', nombreKichwa: 'Inti Raymi', nombreEspanol: 'Fiesta del Sol', categoria: CategoriasCultural.FESTIVIDADES },
                { idUnico: 'fest-2', imagen: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', nombreKichwa: 'Pawkar Raymi', nombreEspanol: 'Taita Carnaval', categoria: CategoriasCultural.FESTIVIDADES },
                { idUnico: 'fest-3', imagen: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=400', nombreKichwa: 'Killa Raymi', nombreEspanol: 'Fiesta de la Luna', categoria: CategoriasCultural.FESTIVIDADES },
                { idUnico: 'fest-4', imagen: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400', nombreKichwa: 'Kapak Raymi', nombreEspanol: 'Fiesta del Inca', categoria: CategoriasCultural.FESTIVIDADES },
                { idUnico: 'fest-5', imagen: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400', nombreKichwa: 'Kuya Raymi', nombreEspanol: 'Fiesta de la Purificación', categoria: CategoriasCultural.FESTIVIDADES },
                { idUnico: 'fest-6', imagen: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=400', nombreKichwa: 'Mushuk Nina', nombreEspanol: 'Fuego Nuevo', categoria: CategoriasCultural.FESTIVIDADES }
            ]
        };

        return imagenesDB[categoria] || [];
    }
}
