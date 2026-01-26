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
import { MessageModule } from 'primeng/message';

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
        TooltipModule,
        MessageModule
    ],
    templateUrl: './estadisticas-jugador.component.html',
    styleUrls: ['./estadisticas-jugador.component.scss']
})
export class EstadisticasJugadorComponent implements OnInit {
    estadisticas?: EstadisticasDetalladasResponse;
    cargando = true;
    error: string | null = null;

    // Datos para gráficos
    chartPuntuaciones: any;
    chartPorNivel: any;
    chartPorCategoria: any;

    // Opciones de gráficos
    chartOptions: any;
    chartDoughnutOptions: any;

    constructor(
        private estadisticasService: EstadisticasService,
        private sesionService: SesionService,
        private router: Router
    ) {
        this.configurarGraficos();
    }

    ngOnInit() {
        console.log('🚀 Iniciando componente de estadísticas');

        const usuario = this.sesionService.getUsuario();
        console.log('👤 Usuario obtenido:', usuario);

        if (!usuario) {
            console.warn('⚠️ No hay usuario en sesión, redirigiendo...');
            this.router.navigate(['/bienvenida']);
            return;
        }

        console.log('📊 Cargando estadísticas para usuario ID:', usuario.id);
        this.cargarEstadisticas(usuario.id);
    }

    cargarEstadisticas(usuarioId: number) {
        console.log('🔄 Iniciando carga de estadísticas para ID:', usuarioId);
        this.cargando = true;
        this.error = null;

        this.estadisticasService.obtenerEstadisticasDetalladas(usuarioId).subscribe({
            next: (data) => {
                console.log('✅ Estadísticas recibidas exitosamente:', data);
                this.estadisticas = data;

                // Debug detallado
                console.log('📈 Resumen General:', data.resumenGeneral);
                console.log('📋 Historial (primeras 3):', data.historialPartidas?.slice(0, 3));
                console.log('🎯 Estadísticas por nivel:', data.estadisticasPorNivel);
                console.log('🎨 Estadísticas por categoría:', data.estadisticasPorCategoria);
                console.log('📊 Gráfico puntuaciones:', data.graficoPuntuaciones);
                console.log('🏆 Mejores partidas:', data.mejoresPartidas);
                console.log('🔥 Rachas:', data.rachas);

                this.generarGraficos();
                this.cargando = false;
            },
            error: (error) => {
                console.error('❌ Error completo:', error);
                console.error('📍 Status:', error.status);
                console.error('📍 StatusText:', error.statusText);
                console.error('📍 Error:', error.error);
                console.error('📍 Message:', error.message);

                this.error = this.obtenerMensajeError(error);
                this.cargando = false;
            }
        });
    }

    obtenerMensajeError(error: any): string {
        if (error.status === 0) {
            return 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else if (error.status === 404) {
            return 'No se encontraron estadísticas para este usuario. ¿Has jugado alguna partida?';
        } else if (error.status === 401 || error.status === 403) {
            return 'No tienes permisos para ver estas estadísticas.';
        } else if (error.status >= 500) {
            return 'Error en el servidor. Por favor, intenta más tarde.';
        }
        return error.error?.message || error.message || 'Error desconocido al cargar estadísticas';
    }

    configurarGraficos() {
        // Configuración para gráficos de línea y barras
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '600',
                            family: 'system-ui, -apple-system, sans-serif'
                        },
                        color: '#666',
                        usePointStyle: true,
                        pointStyle: 'circle',
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    padding: 12,
                    cornerRadius: 12,
                    titleFont: {
                        size: 14,
                        weight: '700',
                        family: 'system-ui, -apple-system, sans-serif'
                    },
                    bodyFont: {
                        size: 13,
                        weight: '600',
                        family: 'system-ui, -apple-system, sans-serif'
                    },
                    displayColors: true,
                    boxWidth: 12,
                    boxHeight: 12,
                    usePointStyle: true,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#999',
                        font: {
                            size: 12,
                            weight: '600',
                            family: 'system-ui, -apple-system, sans-serif'
                        },
                        padding: 10,
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false,
                        lineWidth: 1,
                    },
                    ticks: {
                        color: '#999',
                        font: {
                            size: 12,
                            weight: '600',
                            family: 'system-ui, -apple-system, sans-serif'
                        },
                        padding: 10,
                        stepSize: 20,
                    },
                    border: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart',
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        };

        // Configuración para gráfico doughnut
        this.chartDoughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13,
                            weight: '600',
                            family: 'system-ui, -apple-system, sans-serif'
                        },
                        color: '#666',
                        usePointStyle: true,
                        pointStyle: 'circle',
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                        label: (context: any) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeInOutQuart',
            },
        };
    }

    generarGraficos() {
        if (!this.estadisticas) {
            console.warn('⚠️ No hay estadísticas para generar gráficos');
            return;
        }

        console.log('📊 Generando gráficos...');

        // Gráfico de puntuaciones a lo largo del tiempo
        const puntuacionesData = this.estadisticas.graficoPuntuaciones || [];
        console.log('📈 Datos de puntuaciones:', puntuacionesData);

        this.chartPuntuaciones = {
            labels: puntuacionesData.map(p => p.fecha),
            datasets: [
                {
                    label: 'Puntuación',
                    data: puntuacionesData.map(p => p.puntuacion),
                    fill: true,
                    tension: 0.4,
                    borderColor: '#667eea',
                    backgroundColor: (context: any) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
                        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.0)');
                        return gradient;
                    },
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#764ba2',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                }
            ]
        };

        // Gráfico por nivel
        const nivelData = this.estadisticas.estadisticasPorNivel || [];
        console.log('🎯 Datos por nivel:', nivelData);

        this.chartPorNivel = {
            labels: nivelData.map(e => this.getNivelLabel(e.nivel)),
            datasets: [
                {
                    data: nivelData.map(e => e.partidasJugadas),
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',   // Verde (Fácil)
                        'rgba(245, 158, 11, 0.8)',   // Naranja (Medio)
                        'rgba(239, 68, 68, 0.8)',    // Rojo (Difícil)
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                    ],
                    borderWidth: 3,
                    hoverOffset: 15,
                    hoverBorderWidth: 4,
                    hoverBorderColor: '#ffffff',
                }
            ]
        };

        // Gráfico por categoría
        const categoriaData = this.estadisticas.estadisticasPorCategoria || [];
        console.log('🎨 Datos por categoría:', categoriaData);

        this.chartPorCategoria = {
            labels: categoriaData.map(e => this.getCategoriaLabel(e.categoria)),
            datasets: [
                {
                    label: 'Puntuación Promedio',
                    data: categoriaData.map(e => e.puntuacionPromedio),
                    backgroundColor: (context: any) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.9)');
                        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.7)');
                        return gradient;
                    },
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }
            ]
        };

        console.log('✅ Gráficos generados exitosamente');
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

    recargarEstadisticas() {
        const usuario = this.sesionService.getUsuario();
        if (usuario) {
            this.cargarEstadisticas(usuario.id);
        }
    }
}
