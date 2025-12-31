// mapa-ingapirca.component.ts - REEMPLAZAR COMPLETO

import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { ProgressBar } from 'primeng/progressbar';
import { Subject, takeUntil } from 'rxjs';

import { ExploracionService } from '@/services/exploracion.service';
import { PuntoInteres, CategoriaPunto, NivelDescubrimiento } from '@/models/exploracion.model';
import { FilterPipe } from '@/juegos/mapa-ingapirca/filter.pipe';
import { PrimeTemplate } from 'primeng/api';

@Component({
    selector: 'app-mapa-ingapirca',
    standalone: true,
    imports: [
        CommonModule,
        Card,
        Button,
        Tooltip,
        Dialog,
        ProgressBar,
        FilterPipe,
        PrimeTemplate
    ],
    templateUrl: './mapa-ingapirca.component.html',
    styleUrls: ['./mapa-ingapirca.component.scss']
})
export class MapaIngapircaComponent implements OnInit, OnDestroy {
    // ✅ INPUTS/OUTPUTS PARA MODO MISIÓN
    @Input() puntoDestacado: number | null = null;
    @Input() modoVisita: boolean = false;
    @Input() puntosDisponibles: number[] = [];
    @Output() puntoVisitado = new EventEmitter<number>();

    puntos: PuntoInteres[] = [];
    puntoSeleccionado: PuntoInteres | null = null;
    mostrarDetalle = false;
    cargandoNarrativa = false;

    // Para animación de typing
    narrativaActual: string = '';
    narrativaVisible = '';
    narrativaCompleta = false;
    typingInterval: any;

    private destroy$ = new Subject<void>();

    // Enums para template
    CategoriaPunto = CategoriaPunto;
    NivelDescubrimiento = NivelDescubrimiento;

    constructor(private exploracionService: ExploracionService) {}

    ngOnInit(): void {
        this.cargarPuntos();

        // ✅ Si hay punto destacado, auto-seleccionarlo
        if (this.puntoDestacado) {
            setTimeout(() => {
                this.seleccionarPuntoAutomaticamente(this.puntoDestacado!);
            }, 500);
        }
    }

    cargarPuntos(): void {
        this.exploracionService.obtenerPuntosInteres()
            .pipe(takeUntil(this.destroy$))
            .subscribe(puntos => {
                this.puntos = puntos;

                // ✅ En modo misión, solo habilitar puntos específicos
                if (this.modoVisita && this.puntosDisponibles.length > 0) {
                    this.puntos.forEach(punto => {
                        punto.desbloqueado = this.puntosDisponibles.includes(punto.id);
                    });
                }
            });
    }

    // ✅ NUEVO: Auto-seleccionar punto para misión
    seleccionarPuntoAutomaticamente(puntoId: number): void {
        const punto = this.puntos.find(p => p.id === puntoId);
        if (punto && punto.desbloqueado) {
            this.seleccionarPunto(punto);
        }
    }

    seleccionarPunto(punto: PuntoInteres): void {
        if (!punto.desbloqueado) {
            return;
        }

        this.puntoSeleccionado = punto;
        this.mostrarDetalle = true;
        this.narrativaVisible = '';
        this.narrativaCompleta = false;

        // Determinar nivel de narrativa
        const nivel = this.determinarNivel(punto);
        this.generarNarrativa(punto.id, nivel);
    }

    private determinarNivel(punto: PuntoInteres): string {
        if (punto.nivelDescubrimiento === NivelDescubrimiento.NO_VISITADO) {
            return 'bronce';
        } else if (punto.nivelDescubrimiento === NivelDescubrimiento.BRONCE) {
            return 'plata';
        } else {
            return 'oro';
        }
    }

    generarNarrativa(puntoId: number, nivel: string): void {
        this.cargandoNarrativa = true;

        this.exploracionService.generarNarrativa(puntoId, nivel)
            .pipe(takeUntil(this.destroy$))
            .subscribe(narrativa => {
                this.cargandoNarrativa = false;
                this.narrativaActual = narrativa.texto;
                this.animarTexto(narrativa.texto);
            });
    }

    private animarTexto(texto: string): void {
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
        }, 20); // Más rápido
    }

    saltarAnimacion(): void {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.narrativaVisible = this.narrativaActual;
            this.narrativaCompleta = true;
        }
    }

    cerrarDetalle(): void {
        this.mostrarDetalle = false;
        this.puntoSeleccionado = null;
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
    }

    // ✅ ACTUALIZAR: Confirmar visita
    completarVisita(): void {
        if (!this.puntoSeleccionado) return;

        // Marcar como visitado
        this.puntoSeleccionado.visitado = true;

        // Actualizar nivel
        if (this.puntoSeleccionado.nivelDescubrimiento === NivelDescubrimiento.NO_VISITADO) {
            this.puntoSeleccionado.nivelDescubrimiento = NivelDescubrimiento.BRONCE;
        } else if (this.puntoSeleccionado.nivelDescubrimiento === NivelDescubrimiento.BRONCE) {
            this.puntoSeleccionado.nivelDescubrimiento = NivelDescubrimiento.PLATA;
        } else if (this.puntoSeleccionado.nivelDescubrimiento === NivelDescubrimiento.PLATA) {
            this.puntoSeleccionado.nivelDescubrimiento = NivelDescubrimiento.ORO;
        }

        // ✅ Si estamos en modo misión, emitir evento
        if (this.modoVisita) {
            this.puntoVisitado.emit(this.puntoSeleccionado.id);
            this.cerrarDetalle();
        } else {
            // Modo exploración normal
            this.desbloquearPuntosDependientes(this.puntoSeleccionado.id);
            this.cerrarDetalle();
        }
    }

    private desbloquearPuntosDependientes(puntoId: number): void {
        this.puntos.forEach(punto => {
            if (punto.requisitos && punto.requisitos.includes(puntoId)) {
                const requisitosCompletos = punto.requisitos.every(reqId =>
                    this.puntos.find(p => p.id === reqId)?.visitado
                );
                if (requisitosCompletos) {
                    punto.desbloqueado = true;
                }
            }
        });
    }

    obtenerIconoCategoria(categoria: CategoriaPunto): string {
        return ''
    }

    obtenerColorNivel(nivel: NivelDescubrimiento): string {
        const colores = {
            [NivelDescubrimiento.NO_VISITADO]: '#999',
            [NivelDescubrimiento.BRONCE]: '#CD7F32',
            [NivelDescubrimiento.PLATA]: '#C0C0C0',
            [NivelDescubrimiento.ORO]: '#FFD700'
        };
        return colores[nivel];
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
    }
}
