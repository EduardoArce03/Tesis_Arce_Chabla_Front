// mapa-ingapirca.component.ts
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

import { ExploracionService } from '@/services/exploracion_final.service';
import {
    PuntoInteresDTO,
    DescubrirPuntoRequest,
    RecompensaDTO,
    NivelCapaDTO,
    NivelCapa,
    NivelDescubrimiento,  // ✅ AGREGADO
    CategoriaPunto
} from '../../models/explorasion.model';

// ✅ PIPE PERSONALIZADO PARA FILTRAR
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], field: string, value: any): any[] {
        if (!items || !field) return items;
        return items.filter(item => item[field] === value);
    }
}

@Component({
    selector: 'app-mapa-ingapirca',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TooltipModule,
        DialogModule,
        ProgressBarModule,
        ToastModule,
        FilterPipe  // ✅ Agregar el pipe
    ],
    providers: [MessageService],
    templateUrl: './exploracion-ingapirca.component.html',
    styleUrls: ['./exploracion-ingapirca.component.scss']
})
export class ExploracionIngapircaComponent implements OnInit, OnDestroy {
    @Input() puntoDestacado: number | null = null;
    @Input() modoVisita = false;
    @Input() puntosDisponibles: number[] = [];
    @Output() puntoVisitado = new EventEmitter<number>();

    puntos: PuntoInteresDTO[] = [];
    puntoSeleccionado: PuntoInteresDTO | null = null;
    mostrarDetalle = false;
    cargandoNarrativa = false;

    narrativaActual = '';
    narrativaVisible = '';
    narrativaCompleta = false;
    typingInterval: any;

    partidaId = 1; // Obtener de AuthService
    usuarioId = 1; // Obtener de AuthService

    private destroy$ = new Subject<void>();

    // ✅ Enums para template
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

    inicializar(): void {
        // Inicializar exploración si no existe
        this.exploracionService.inicializarExploracion(this.partidaId, this.usuarioId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.cargarPuntos();

                    // Auto-seleccionar punto si hay destacado
                    if (this.puntoDestacado) {
                        setTimeout(() => this.seleccionarPuntoAutomaticamente(this.puntoDestacado!), 500);
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

                    // En modo misión, filtrar
                    if (this.modoVisita && this.puntosDisponibles.length > 0) {
                        this.puntos.forEach(punto => {
                            punto.desbloqueado = this.puntosDisponibles.includes(punto.id);
                        });
                    }
                },
                error: (error) => {
                    console.error('Error cargando puntos:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los puntos'
                    });
                }
            });
    }

    seleccionarPuntoAutomaticamente(puntoId: number): void {
        const punto = this.puntos.find(p => p.id === puntoId);
        if (punto && punto.desbloqueado) {
            this.seleccionarPunto(punto);
        }
    }

    seleccionarPunto(punto: PuntoInteresDTO): void {
        if (!punto.desbloqueado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Punto Bloqueado',
                detail: `Necesitas explorar más puntos para desbloquear este lugar`
            });
            return;
        }

        this.puntoSeleccionado = punto;
        this.mostrarDetalle = true;
        this.narrativaVisible = '';
        this.narrativaCompleta = false;
        this.cargandoNarrativa = true;

        // Simular carga de narrativa
        setTimeout(() => {
            this.cargandoNarrativa = false;
            this.narrativaActual = punto.descripcion || 'Narrativa generada por IA...';
            this.animarTexto(this.narrativaActual);
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
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.narrativaVisible = this.narrativaActual;
            this.narrativaCompleta = true;
        }
    }

    completarVisita(): void {
        if (!this.puntoSeleccionado) return;

        const request: DescubrirPuntoRequest = {
            partidaId: this.partidaId,
            puntoId: this.puntoSeleccionado.id
        };

        this.exploracionService.descubrirPunto(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    // Mostrar narrativa generada
                    if (response.narrativaGenerada) {
                        this.narrativaActual = response.narrativaGenerada;
                        this.animarTexto(this.narrativaActual);
                    }

                    // Mostrar recompensas
                    if (response.recompensas.length > 0) {
                        this.mostrarRecompensas(response.recompensas);
                    }

                    // Nueva capa desbloqueada
                    if (response.nuevaCapaDesbloqueada) {
                        //this.mostrarNuevaCapa(response.nuevaCapaDesbloqueada);
                    }

                    // Emitir evento en modo misión
                    if (this.modoVisita) {
                        this.puntoVisitado.emit(this.puntoSeleccionado!.id);
                    }

                    // Recargar puntos
                    setTimeout(() => {
                        this.cargarPuntos();
                        this.cerrarDetalle();
                    }, 2000);
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

    mostrarRecompensas(recompensas: RecompensaDTO[]): void {
        recompensas.forEach((recompensa, index) => {
            setTimeout(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: `🎁 ${recompensa.tipo}`,
                    detail: `+${recompensa.cantidad} - ${recompensa.descripcion}`,
                    life: 5000
                });
            }, index * 500);
        });
    }

    mostrarNuevaCapa(capa: NivelCapaDTO): void {
        this.messageService.add({
            severity: 'info',
            summary: '🎉 ¡Nueva Capa Temporal Desbloqueada!',
            detail: `${capa.nombre}: ${capa.descripcion}`,
            life: 8000,
            sticky: true
        });
    }

    cerrarDetalle(): void {
        this.mostrarDetalle = false;
        this.puntoSeleccionado = null;
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
    }

    // ✅ MÉTODOS AUXILIARES PARA EL TEMPLATE

    obtenerColorNivel(nivel: NivelDescubrimiento | null): string {
        const colores = {
            [NivelDescubrimiento.NO_VISITADO]: '#999999',
            [NivelDescubrimiento.BRONCE]: '#CD7F32',
            [NivelDescubrimiento.PLATA]: '#C0C0C0',
            [NivelDescubrimiento.ORO]: '#FFD700'
        };
        return nivel ? colores[nivel] : '#999999';
    }

    obtenerIconoCategoria(categoria: CategoriaPunto): string {
        const iconos = {
            [CategoriaPunto.TEMPLO]: 'pi-sun',
            [CategoriaPunto.PLAZA]: 'pi-map',
            [CategoriaPunto.VIVIENDA]: 'pi-home',
            [CategoriaPunto.DEPOSITO]: 'pi-box',
            [CategoriaPunto.OBSERVATORIO]: 'pi-eye',
            [CategoriaPunto.CEREMONIAL]: 'pi-circle'  // ✅ AGREGAR ESTO
        };
        return iconos[categoria as keyof typeof iconos] || 'pi-star';
    }

    obtenerEmojiCategoria(categoria: CategoriaPunto): string {
        const emojis: {
            [CategoriaPunto.TEMPLO]: string;
            [CategoriaPunto.PLAZA]: string;
            [CategoriaPunto.VIVIENDA]: string;
            [CategoriaPunto.DEPOSITO]: string;
            [CategoriaPunto.OBSERVATORIO]: string;
            [CategoriaPunto.CEREMONIAL]: string
        } = {
            [CategoriaPunto.TEMPLO]: '☀️',
            [CategoriaPunto.PLAZA]: '🗺️',
            [CategoriaPunto.VIVIENDA]: '🏠',
            [CategoriaPunto.DEPOSITO]: '📦',
            [CategoriaPunto.OBSERVATORIO]: '👁️',
            [CategoriaPunto.CEREMONIAL]: '💧'  // ✅ AGREGAR ESTO
        };
        return emojis[categoria as keyof typeof emojis] || '✨';
    }

    obtenerNombreNivel(nivel: NivelDescubrimiento | null): string {
        const nombres = {
            [NivelDescubrimiento.NO_VISITADO]: 'Nueva Exploración',
            [NivelDescubrimiento.BRONCE]: 'Nivel Bronce',
            [NivelDescubrimiento.PLATA]: 'Nivel Plata',
            [NivelDescubrimiento.ORO]: 'Nivel Oro'
        };
        return nombres[nivel as keyof typeof nombres] || 'Desconocido';
    }

    obtenerLetraNivel(nivel: NivelDescubrimiento.BRONCE | NivelDescubrimiento.PLATA | NivelDescubrimiento.ORO | null): string {
        const letras = {
            [NivelDescubrimiento.NO_VISITADO]: '',
            [NivelDescubrimiento.BRONCE]: 'B',
            [NivelDescubrimiento.PLATA]: 'P',
            [NivelDescubrimiento.ORO]: 'O'
        };
        return letras[nivel as keyof typeof letras] || 'Desconocido';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
    }
}
