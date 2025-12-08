// components/mapa-ingapirca/mapa-ingapirca.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ExploracionService } from '@/services/exploracion.service';
import { PuntoInteres, CategoriaPunto, NivelDescubrimiento } from '@/models/exploracion.model';
import { Subject, takeUntil } from 'rxjs';
import { FilterPipe } from '@/juegos/mapa-ingapirca/filter.pipe';

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
        FilterPipe
    ],
    templateUrl: './mapa-ingapirca.component.html',
    styleUrls: ['./mapa-ingapirca.component.scss']
})
export class MapaIngapircaComponent implements OnInit, OnDestroy {
    puntos: PuntoInteres[] = [];
    puntoSeleccionado: PuntoInteres | null = null;
    mostrarDetalle = false;
    cargandoNarrativa = false;
    narrativaActual = '';

    // Para animación de typing
    narrativaVisible = '';
    typingInterval: any;

    private destroy$ = new Subject<void>();

    // Enum para el template
    CategoriaPunto = CategoriaPunto;
    NivelDescubrimiento = NivelDescubrimiento;

    constructor(private exploracionService: ExploracionService) {}

    ngOnInit(): void {
        this.cargarPuntos();
    }

    cargarPuntos(): void {
        this.exploracionService.obtenerPuntosInteres()
            .pipe(takeUntil(this.destroy$))
            .subscribe(puntos => {
                this.puntos = puntos;
            });
    }

    seleccionarPunto(punto: PuntoInteres): void {
        if (!punto.desbloqueado) {
            // Mostrar mensaje de requisitos
            return;
        }

        this.puntoSeleccionado = punto;
        this.mostrarDetalle = true;
        this.narrativaVisible = '';

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

        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }

        this.typingInterval = setInterval(() => {
            if (index < texto.length) {
                this.narrativaVisible += texto.charAt(index);
                index++;
            } else {
                clearInterval(this.typingInterval);
            }
        }, 30); // 30ms por carácter
    }

    saltarAnimacion(): void {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.narrativaVisible = this.narrativaActual;
        }
    }

    cerrarDetalle(): void {
        this.mostrarDetalle = false;
        this.puntoSeleccionado = null;
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
    }

    completarVisita(): void {
        if (this.puntoSeleccionado) {
            // Marcar como visitado y actualizar nivel
            this.puntoSeleccionado.visitado = true;

            if (this.puntoSeleccionado.nivelDescubrimiento === NivelDescubrimiento.NO_VISITADO) {
                this.puntoSeleccionado.nivelDescubrimiento = NivelDescubrimiento.BRONCE;
            } else if (this.puntoSeleccionado.nivelDescubrimiento === NivelDescubrimiento.BRONCE) {
                this.puntoSeleccionado.nivelDescubrimiento = NivelDescubrimiento.PLATA;
            } else if (this.puntoSeleccionado.nivelDescubrimiento === NivelDescubrimiento.PLATA) {
                this.puntoSeleccionado.nivelDescubrimiento = NivelDescubrimiento.ORO;
            }

            // Desbloquear puntos dependientes
            this.desbloquearPuntosDependientes(this.puntoSeleccionado.id);

            // Aquí harías el POST al backend
            // this.exploracionService.visitarPunto(userId, puntoId).subscribe(...)

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
        const iconos = {
            [CategoriaPunto.TEMPLO]: 'pi-sun',
            [CategoriaPunto.PLAZA]: 'pi-map',
            [CategoriaPunto.VIVIENDA]: 'pi-home',
            [CategoriaPunto.DEPOSITO]: 'pi-box',
            [CategoriaPunto.OBSERVATORIO]: 'pi-eye',
            [CategoriaPunto.CEREMONIAL]: 'pi-sparkles'
        };
        return iconos[categoria] || 'pi-circle';
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
