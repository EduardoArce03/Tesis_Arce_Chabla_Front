// components/lista-misiones/lista-misiones.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { TabPanel, TabPanels, Tabs } from 'primeng/tabs';           // ← NUEVO
import { Mision, EstadoMision, DificultadMision } from '../../models/mision.model';
import { MisionService } from '@/juegos/misiones/services/mision..service';

@Component({
    selector: 'app-lista-misiones',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, ProgressBarModule, TooltipModule, AvatarModule, TabPanel, TabPanels, Tabs],
    templateUrl: './lista-misiones.component.html',
    styleUrls: ['./lista-misiones.component.scss']
})
export class ListaMisionesComponent implements OnInit, OnDestroy {
    misionesDisponibles: Mision[] = [];
    misionesEnProgreso: Mision[] = [];
    misionesCompletadas: Mision[] = [];
    misionesBloqueadas: Mision[] = [];

    estadisticas: any = null;

    private destroy$ = new Subject<void>();

    // Enums para template
    EstadoMision = EstadoMision;
    DificultadMision = DificultadMision;

    constructor(
        private misionService: MisionService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.cargarMisiones();
        this.cargarEstadisticas();
    }

    cargarMisiones(): void {
        this.misionService
            .obtenerMisiones()
            .pipe(takeUntil(this.destroy$))
            .subscribe((misiones: any[]) => {
                this.misionesDisponibles = misiones.filter((m) => m.estado === EstadoMision.DISPONIBLE);
                this.misionesEnProgreso = misiones.filter((m) => m.estado === EstadoMision.EN_PROGRESO);
                this.misionesCompletadas = misiones.filter((m) => m.estado === EstadoMision.COMPLETADA);
                this.misionesBloqueadas = misiones.filter((m) => m.estado === EstadoMision.BLOQUEADA);
            });
    }

    cargarEstadisticas(): void {
        this.misionService
            .obtenerEstadisticas()
            .pipe(takeUntil(this.destroy$))
            .subscribe((stats: any) => {
                this.estadisticas = stats;
            });
    }

    verDetalleMision(mision: Mision): void {
        this.router.navigate(['/juegos/misiones', mision.id]);
    }

    continuarMision(mision: Mision): void {
        this.router.navigate(['/juegos/misiones', mision.id, 'ejecutar']);
    }

    obtenerIconoDificultad(dificultad: DificultadMision): string {
        const iconos = {
            [DificultadMision.FACIL]: '⭐',
            [DificultadMision.MEDIO]: '⭐⭐',
            [DificultadMision.DIFICIL]: '⭐⭐⭐',
            [DificultadMision.EXPERTO]: '⭐⭐⭐⭐'
        };
        return iconos[dificultad];
    }

    obtenerColorDificultad(dificultad: DificultadMision): 'success' | 'info' | 'warn' | 'danger' {
        const colores: Record<DificultadMision, 'success' | 'info' | 'warn' | 'danger'> = {
            [DificultadMision.FACIL]: 'success',
            [DificultadMision.MEDIO]: 'info',
            [DificultadMision.DIFICIL]: 'warn',      // ← Cambié 'warning' a 'warn'
            [DificultadMision.EXPERTO]: 'danger'
        };
        return colores[dificultad];
    }

    obtenerTextoRequisitos(mision: Mision): string {
        const requisitos: string[] = [];

        if (mision.requisitos.nivelMinimo) {
            requisitos.push(`Nivel ${mision.requisitos.nivelMinimo}`);
        }

        if (mision.requisitos.misionesPrevias && mision.requisitos.misionesPrevias.length > 0) {
            requisitos.push(`${mision.requisitos.misionesPrevias.length} misiones previas`);
        }

        return requisitos.join(' • ') || 'Sin requisitos';
    }

    calcularProgreso(mision: Mision): number {
        if (!mision.progreso) return 0;
        return (mision.progreso.faseActual / mision.fases.length) * 100;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
