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
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { MisionService } from '../../services/mision.service';
import {
    MisionCardDTO,
    EstadoMision,
    DificultadMision,
    EstadisticasMisionesDTO
} from '../../models/mision.model';
import { SesionService } from '@/services/sesion.service';

@Component({
    selector: 'app-lista-misiones',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TagModule,
        ProgressBarModule,
        TooltipModule,
        AvatarModule,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './lista-misiones.component.html',
    styleUrls: ['./lista-misiones.component.scss']
})
export class ListaMisionesComponent implements OnInit, OnDestroy {
    misionesDisponibles: MisionCardDTO[] = [];
    misionesEnProgreso: MisionCardDTO[] = [];
    misionesCompletadas: MisionCardDTO[] = [];
    misionesBloqueadas: MisionCardDTO[] = [];

    estadisticas: EstadisticasMisionesDTO | null = null;
    cargando = true;

    private destroy$ = new Subject<void>();

    // Enums para template
    EstadoMision = EstadoMision;
    DificultadMision = DificultadMision;

    constructor(
        private misionService: MisionService,
        private sesionService: SesionService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        this.cargarMisiones(usuario.id);
    }

    cargarMisiones(usuarioId: number): void {
        this.cargando = true;

        this.misionService.obtenerMisiones(usuarioId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.misionesDisponibles = response.disponibles;
                    this.misionesEnProgreso = response.enProgreso;
                    this.misionesCompletadas = response.completadas;
                    this.misionesBloqueadas = response.bloqueadas;
                    this.estadisticas = response.estadisticas;
                    this.cargando = false;
                },
                error: (error) => {
                    console.error('Error cargando misiones:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar las misiones'
                    });
                    this.cargando = false;
                }
            });
    }

    verDetalleMision(mision: MisionCardDTO): void {
        this.router.navigate(['/juegos/misiones', mision.id]);
    }

    continuarMision(mision: MisionCardDTO): void {
        this.router.navigate(['/juegos/misiones', mision.id, 'ejecutar']);
    }

    obtenerIconoDificultad(dificultad: DificultadMision): string {
        const iconos: Record<DificultadMision, string> = {
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
            [DificultadMision.DIFICIL]: 'warn',
            [DificultadMision.EXPERTO]: 'danger'
        };
        return colores[dificultad];
    }

    calcularProgreso(mision: MisionCardDTO): number {
        if (!mision.progreso) return 0;
        return mision.progreso.porcentajeCompletado;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
