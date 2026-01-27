// capas-punto.component.ts - CORREGIDO CON TUS DTOs REALES

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';

// ✅ USAR TUS DTOs REALES
import {
    CapaPuntoDTO,
    NivelDescubrimiento,
    NivelCapa
} from '@/models/explorasion.model';

@Component({
    selector: 'app-capas-punto',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        ProgressBarModule,
        BadgeModule,
        TagModule
    ],
    template: `
        <div class="capas-container">
            <h3>📜 Capas Temporales - {{ nombrePunto }}</h3>
            <p class="subtitle">Explora {{ nombrePunto }} a través del tiempo</p>

            <div class="progreso-general">
                <span>{{ capasCompletadas }} de 4 capas exploradas</span>
                <p-progressBar
                    [value]="(capasCompletadas / 4) * 100"
                    [showValue]="false">
                </p-progressBar>
            </div>

            <!-- Lista de capas -->
            <div class="capas-lista">
                @for (capa of capas; track capa.nivelCapa) {
                    <div class="capa-card"
                         [class.desbloqueada]="capa.desbloqueada"
                         [class.bloqueada]="!capa.desbloqueada">

                        <p-card>
                            <ng-template pTemplate="header">
                                <div class="capa-header">
                                    <div class="capa-info">
                                        <h4>
                                            <span class="capa-icono">{{ obtenerIconoCapa(capa.nivelCapa) }}</span>
                                            {{ capa.nombre }}
                                        </h4>
                                        <span class="descripcion">{{ capa.descripcion }}</span>
                                    </div>

                                    <!-- Badge de nivel alcanzado -->
                                    @if (capa.desbloqueada && capa.nivelDescubrimiento !== NivelDescubrimiento.NO_VISITADO) {
                                        <div class="badge-nivel"
                                             [class.oro]="capa.nivelDescubrimiento === NivelDescubrimiento.ORO"
                                             [class.plata]="capa.nivelDescubrimiento === NivelDescubrimiento.PLATA"
                                             [class.bronce]="capa.nivelDescubrimiento === NivelDescubrimiento.BRONCE">
                                            {{ obtenerEmojiBadge(capa.nivelDescubrimiento) }}
                                        </div>
                                    }
                                </div>
                            </ng-template>

                            <!-- Contenido de la capa -->
                            <div class="capa-contenido">
                                <!-- BLOQUEADA -->
                                @if (!capa.desbloqueada) {
                                    <div class="capa-bloqueada">
                                        <i class="pi pi-lock" style="font-size: 2rem;"></i>
                                        <p>Completa la capa anterior para desbloquear</p>
                                    </div>
                                }

                                <!-- DESBLOQUEADA -->
                                @if (capa.desbloqueada) {
                                    <div class="capa-progreso">
                                        <!-- Barra de progreso -->
                                        <div class="progreso-section">
                                            <div class="flex justify-content-between mb-2">
                                                <span>Progreso General</span>
                                                <span class="font-bold">{{ formatearPorcentaje(capa.porcentajeCompletitud) }}
                                                    </span>
                                            </div>
                                            <p-progressBar
                                                [value]="capa.porcentajeCompletitud"
                                                [showValue]="false">
                                            </p-progressBar>
                                        </div>

                                        <!-- Checklist -->
                                        <div class="checklist">
                                            <!-- Narrativa -->
                                            <div class="checklist-item"
                                                 [class.completado]="capa.narrativaLeida">
                                                <i class="pi"
                                                   [class.pi-check-circle]="capa.narrativaLeida"
                                                   [class.pi-circle]="!capa.narrativaLeida"></i>
                                                <span>Narrativa histórica</span>
                                            </div>

                                            <!-- Fotografías -->
                                            <div class="checklist-item"
                                                 [class.completado]="capa.fotografiasCompletadas === capa.fotografiasRequeridas">
                                                <i class="pi"
                                                   [class.pi-check-circle]="capa.fotografiasCompletadas === capa.fotografiasRequeridas"
                                                   [class.pi-circle]="capa.fotografiasCompletadas < capa.fotografiasRequeridas"></i>
                                                <span>Fotografías: {{ capa.fotografiasCompletadas ?? 0 }}/{{ capa.fotografiasRequeridas ?? 0 }}</span>
                                                @if (capa.fotografiasCompletadas < capa.fotografiasRequeridas) {
                                                    <p-tag severity="warn"
                                                           [value]="'Faltan ' + (capa.fotografiasRequeridas - capa.fotografiasCompletadas)">
                                                    </p-tag>
                                                }
                                            </div>

                                            <!-- Diálogos -->
                                            <div class="checklist-item"
                                                 [class.completado]="capa.dialogosRealizados > 0">
                                                <i class="pi"
                                                   [class.pi-check-circle]="capa.dialogosRealizados > 0"
                                                   [class.pi-circle]="capa.dialogosRealizados === 0"></i>
                                                <span>Diálogo con espíritu</span>
                                                @if (capa.dialogosRealizados > 0) {
                                                    <p-badge [value]="capa.dialogosRealizados.toString()"></p-badge>
                                                }
                                            </div>

                                            <!-- Misión -->
                                            @if (capa.misionAsociada) {
                                                <div class="checklist-item"
                                                     [class.completado]="capa.misionCompletada">
                                                    <i class="pi"
                                                       [class.pi-check-circle]="capa.misionCompletada"
                                                       [class.pi-flag]="!capa.misionCompletada"></i>
                                                    <span>Misión: {{ capa.misionAsociada.titulo }}</span>
                                                    @if (!capa.misionCompletada) {
                                                        <p-progressBar
                                                            [value]="capa.misionAsociada.progreso"
                                                            [showValue]="true"
                                                            class="mt-2">
                                                        </p-progressBar>
                                                    }
                                                </div>
                                            }
                                        </div>

                                        <!-- Recompensa si está completa -->
                                        @if (capa.porcentajeCompletitud === 100 && capa.recompensaFinal) {
                                            <div class="recompensa-final">
                                                <i class="pi pi-trophy"></i>
                                                <span>{{ capa.recompensaFinal.descripcion }}</span>
                                                <strong>+{{ capa.recompensaFinal.cantidad }}</strong>
                                            </div>
                                        }

                                        <!-- Botón explorar -->
                                        <div class="action-button">
                                            <p-button
                                                label="Explorar Capa"
                                                icon="pi pi-compass"
                                                styleClass="w-full"
                                                [severity]="capa.porcentajeCompletitud === 100 ? 'success' : 'primary'"
                                                (onClick)="explorarCapa.emit(capa)">
                                            </p-button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </p-card>
                    </div>
                }
            </div>

            <div class="footer-actions">
                <p-button
                    label="Volver al Mapa"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    (onClick)="volver.emit()">
                </p-button>
            </div>
        </div>
    `,
    styles: [`
        .capas-container {
            padding: 1rem;
        }

        h3 {
            margin: 0 0 0.5rem 0;
            color: #2c3e50;
        }

        .subtitle {
            color: #7f8c8d;
            margin: 0 0 1.5rem 0;
        }

        .progreso-general {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;

            span {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #2c3e50;
            }
        }

        .capas-lista {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .capa-card {
            transition: all 0.3s ease;

            &.bloqueada {
                opacity: 0.6;
            }

            &:hover:not(.bloqueada) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
        }

        .capa-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;

            .capa-info {
                flex: 1;

                h4 {
                    margin: 0 0 0.25rem 0;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;

                    .capa-icono {
                        font-size: 1.5rem;
                    }
                }

                .descripcion {
                    font-size: 0.85rem;
                    opacity: 0.9;
                }
            }

            .badge-nivel {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

                &.oro {
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                }

                &.plata {
                    background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
                }

                &.bronce {
                    background: linear-gradient(135deg, #CD7F32, #8B4513);
                }
            }
        }

        .capa-bloqueada {
            text-align: center;
            padding: 2rem;
            color: #95a5a6;

            i {
                margin-bottom: 1rem;
            }

            p {
                margin: 0;
            }
        }

        .capa-progreso {
            padding: 1rem;
        }

        .progreso-section {
            margin-bottom: 1.5rem;
        }

        .checklist {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem;

            .checklist-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                border-radius: 6px;
                background: #f8f9fa;
                transition: all 0.3s;

                &:hover {
                    background: #e9ecef;
                }

                &.completado {
                    background: #d4edda;
                    color: #155724;
                    font-weight: 600;

                    i {
                        color: #28a745;
                    }
                }

                i {
                    font-size: 1.3rem;
                    flex-shrink: 0;
                }

                span {
                    flex: 1;
                }
            }
        }

        .recompensa-final {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            padding: 1rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(253, 203, 110, 0.3);

            i {
                font-size: 1.5rem;
                color: #f39c12;
            }

            span {
                flex: 1;
                font-weight: 600;
                color: #8b6914;
            }

            strong {
                font-size: 1.2rem;
                color: #8b6914;
            }
        }

        .action-button {
            margin-top: 1rem;
        }

        .footer-actions {
            margin-top: 2rem;
            display: flex;
            justify-content: center;
        }

        @media (max-width: 768px) {
            .capa-header {
                flex-direction: column;
                text-align: center;
                gap: 1rem;
            }

            .badge-nivel {
                width: 50px !important;
                height: 50px !important;
                font-size: 1.5rem !important;
            }
        }
    `]
})
export class CapasPuntoComponent {
    @Input() nombrePunto = '';
    @Input() capas: CapaPuntoDTO[] = [];
    @Output() explorarCapa = new EventEmitter<CapaPuntoDTO>();
    @Output() volver = new EventEmitter<void>();

    // Enums para el template
    NivelDescubrimiento = NivelDescubrimiento;
    NivelCapa = NivelCapa;

    // capas-punto.component.ts

    // capas-punto.component.ts

    get capasCompletadas(): number {
        return this.capas.filter(c =>
            Math.round(c.porcentajeCompletitud) === 100
        ).length;
    }

    obtenerIconoCapa(nivelCapa: NivelCapa): string {
        const iconos: Record<NivelCapa, string> = {
            [NivelCapa.SUPERFICIE]: '🏛️',
            [NivelCapa.INCA]: '☀️',
            [NivelCapa.CANARI]: '🌙',
            [NivelCapa.ANCESTRAL]: '⭐'
        };
        return iconos[nivelCapa] || '📜';
    }

    obtenerEmojiBadge(nivel: NivelDescubrimiento): string {
        const emojis: Record<NivelDescubrimiento, string> = {
            [NivelDescubrimiento.NO_VISITADO]: '',
            [NivelDescubrimiento.BRONCE]: '🥉',
            [NivelDescubrimiento.PLATA]: '🥈',
            [NivelDescubrimiento.ORO]: '🥇'
        };
        return emojis[nivel] || '';
    }

    formatearPorcentaje(porcentaje: number | undefined): string {
        return (porcentaje || 0).toFixed(0) + '%';
    }
}
