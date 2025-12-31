import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { EstadisticasService } from '@/services/estadisticas.service';
import { SesionService } from '@/services/sesion.service';
import {
    EstadisticasDetalladasResponse,
} from '@/models/estadisticas.model';
import { CategoriasCultural, NivelDificultad } from '@/models/juego.model';

@Component({
    selector: 'app-estadisticas-jugador',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TableModule,
        TagModule,
        ProgressBarModule,
        ChartModule,
        SkeletonModule,
        TooltipModule
    ],
    templateUrl: './estadisticas-jugador.component.html',
    styleUrls: ['./estadisticas-jugador.component.scss']
})
export class EstadisticasJugadorComponent implements OnInit {
    estadisticas?: EstadisticasDetalladasResponse;
    cargando = true;

    // Datos para gráficos
    chartPuntuaciones: any;
    chartPorNivel: any;
    chartPorCategoria: any;

    // Opciones de gráficos
    chartOptions: any;

    constructor(
        private estadisticasService: EstadisticasService,
        private sesionService: SesionService,
        private router: Router
    ) {
        this.configurarGraficos();
    }

    ngOnInit() {
        const usuario = this.sesionService.getUsuario();

        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        this.cargarEstadisticas(usuario.id);
    }

    cargarEstadisticas(usuarioId: number) {
        this.cargando = true;

        this.estadisticasService.obtenerEstadisticasDetalladas(usuarioId).subscribe({
            next: (data) => {
                this.estadisticas = data;
                this.generarGraficos();
                this.cargando = false;
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
                this.cargando = false;
            }
        });
    }

    configurarGraficos() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    generarGraficos() {
        if (!this.estadisticas) return;

        // Gráfico de puntuaciones a lo largo del tiempo
        this.chartPuntuaciones = {
            labels: this.estadisticas.graficoPuntuaciones.map(p => p.fecha),
            datasets: [
                {
                    label: 'Puntuación',
                    data: this.estadisticas.graficoPuntuaciones.map(p => p.puntuacion),
                    fill: true,
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.2)',
                    tension: 0.4
                }
            ]
        };

        // Gráfico por nivel
        this.chartPorNivel = {
            labels: this.estadisticas.estadisticasPorNivel.map(e => this.getNivelLabel(e.nivel)),
            datasets: [
                {
                    label: 'Partidas Jugadas',
                    data: this.estadisticas.estadisticasPorNivel.map(e => e.partidasJugadas),
                    backgroundColor: ['#667eea', '#FFA500', '#dc3545']
                }
            ]
        };

        // Gráfico por categoría
        this.chartPorCategoria = {
            labels: this.estadisticas.estadisticasPorCategoria.map(e => this.getCategoriaLabel(e.categoria)),
            datasets: [
                {
                    label: 'Puntuación Promedio',
                    data: this.estadisticas.estadisticasPorCategoria.map(e => e.puntuacionPromedio),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
                }
            ]
        };
    }

    getNivelLabel(nivel: NivelDificultad): string {
        const labels: Record<NivelDificultad, string> = {
            [NivelDificultad.FACIL]: 'Fácil',
            [NivelDificultad.MEDIO]: 'Medio',
            [NivelDificultad.DIFICIL]: 'Difícil'
        };
        return labels[nivel];
    }

    getNivelSeverity(nivel: NivelDificultad): 'success' | 'warn' | 'danger' {
        const severities: Record<NivelDificultad, 'success' | 'warn' | 'danger'> = {
            [NivelDificultad.FACIL]: 'success',
            [NivelDificultad.MEDIO]: 'warn',
            [NivelDificultad.DIFICIL]: 'danger'
        };
        return severities[nivel];
    }

    getCategoriaLabel(categoria: CategoriasCultural): string {
        const labels: Record<CategoriasCultural, string> = {
            [CategoriasCultural.VESTIMENTA]: 'Vestimenta',
            [CategoriasCultural.MUSICA]: 'Música',
            [CategoriasCultural.LUGARES]: 'Lugares',
            [CategoriasCultural.FESTIVIDADES]: 'Festividades'
        };
        return labels[categoria];
    }

    formatearTiempo(segundos: number): string {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}:${segs.toString().padStart(2, '0')}`;
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    volverAlDashboard() {
        this.router.navigate(['/']);
    }
}
