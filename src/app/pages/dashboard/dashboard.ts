import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

import { DashboardService } from '../../services/dashboard.service';
import { SesionService } from '../../services/sesion.service';
import { DashboardResponse } from '../../models/dashboard.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        ButtonModule,
        ProgressBarModule,
        ChartModule,
        TagModule,
        AvatarModule,
        SkeletonModule,
        TooltipModule,
        BadgeModule
    ],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
    dashboardData?: DashboardResponse;
    cargando = true;

    constructor(
        private dashboardService: DashboardService,
        private sesionService: SesionService,
        private router: Router
    ) {}

    ngOnInit() {
        const usuario = this.sesionService.getUsuario();

        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        this.cargarDashboard(usuario.id);
    }

    cargarDashboard(usuarioId: number) {
        this.cargando = true;

        this.dashboardService.obtenerDashboard(usuarioId).subscribe({
            next: (data) => {
                this.dashboardData = data;
                this.cargando = false;
            },
            error: (error) => {
                console.error('Error al cargar dashboard:', error);
                this.cargando = false;
            }
        });
    }

    /**
     * Calcula el porcentaje de experiencia para la barra de progreso
     */
    getPorcentajeExperiencia(): number {
        if (!this.dashboardData) return 0;

        const { experiencia, experienciaParaSiguienteNivel } = this.dashboardData.usuario;
        const expNivelActual = (this.dashboardData.usuario.nivel - 1) * 500;
        const expEnNivel = experiencia - expNivelActual;
        const expNecesaria = experienciaParaSiguienteNivel - expNivelActual;

        return Math.round((expEnNivel / expNecesaria) * 100);
    }

    /**
     * Obtiene el icono de medalla según la posición
     */
    getMedalla(posicion: number): string {
        switch (posicion) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${posicion}`;
        }
    }

    /**
     * Navega a un juego
     */
    irAJuego(ruta: string, disponible: boolean) {
        if (disponible) {
            this.router.navigate([ruta]);
        }
    }

    /**
     * Formatea minutos a formato legible
     */
    formatearTiempo(minutos: number): string {
        if (minutos < 60) {
            return `${minutos} min`;
        }
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas}h ${mins}m`;
    }
}
