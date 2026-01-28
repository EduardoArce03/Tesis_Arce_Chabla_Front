import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { EstadisticasService } from '@/services/estadisticas.service';
import { SesionService } from '@/services/sesion.service';
import { takeUntil } from 'rxjs';
import { PartidaService } from '@/components/partida.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, RouterModule, BadgeModule, TooltipModule],
    template: `
        <div class="layout-menu-container">
            <!-- User Progress Card -->
            <div class="menu-user-card">
                <div class="user-avatar">
                    <div class="avatar-ring"></div>
                    <i class="pi pi-user"></i>
                </div>
                <div class="user-level">
                    <span class="level-badge">
                        <i class="pi pi-star-fill"></i>
                        Nivel {{nivel}}
                    </span>
                    <div class="exp-bar">
                        <div class="exp-fill" [style.width]="'{{nivel}}'"></div>
                    </div>
                    <span class="exp-text">{{xp}}/1000 XP</span>
                </div>
            </div>

            <!-- Menu Items -->
            <ul class="layout-menu">
                <ng-container *ngFor="let item of model; let i = index">
                    <li *ngIf="!item.separator" class="menu-category">
                        <div class="category-header">
                            <span class="category-icon">{{ item.emoji }}</span>
                            <span class="category-label">{{ item.label }}</span>
                        </div>

                        <ul class="category-items">
                            <li *ngFor="let subItem of item.items"
                                class="menu-item"
                                [class.disabled]="subItem.disabled"
                                [routerLink]="subItem.routerLink"
                                routerLinkActive="active-item"
                                [pTooltip]="subItem.tooltip"
                                tooltipPosition="right">

                                <div class="item-content">
                                    <span class="item-icon-wrapper">
                                        <i [class]="subItem.icon"></i>
                                    </span>
                                    <div class="item-text">
                                        <span class="item-label">{{ subItem.label }}</span>
                                        <span class="item-description" *ngIf="subItem.description">
                                            {{ subItem.description }}
                                        </span>
                                    </div>
                                    <span class="item-badge" *ngIf="subItem.badge">
                                        <p-badge [value]="subItem.badge" [severity]="subItem.badgeSeverity || 'info'"></p-badge>
                                    </span>
                                    <span class="item-lock" *ngIf="subItem.disabled">
                                        <i class="pi pi-lock"></i>
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </li>

                    <li *ngIf="item.separator" class="menu-separator">
                        <div class="separator-line"></div>
                    </li>
                </ng-container>
            </ul>

            <!-- Quick Stats -->
            <div class="menu-quick-stats">
                <div class="stat-item">
                    <i class="pi pi-play-circle"></i>
                    <div class="stat-info">
                        <span class="stat-value">{{partidas}}</span>
                        <span class="stat-label">Partidas</span>
                    </div>
                </div>
                <div class="stat-item">
                    <i class="pi pi-trophy"></i>
                    <div class="stat-info">
                        <span class="stat-value">#{{ranking}}</span>
                        <span class="stat-label">Ranking</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .layout-menu-container {
            padding: 1.5rem 1rem;
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        /* User Progress Card */
        .menu-user-card {
            background: linear-gradient(135deg, #8B4513 0%, #654321 100%);
            border-radius: 16px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
                animation: rotate 20s linear infinite;
            }

            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .user-avatar {
                width: 80px;
                height: 80px;
                position: relative;
                z-index: 1;

                .avatar-ring {
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.05); opacity: 1; }
                }

                i {
                    position: absolute;
                    inset: 4px;
                    border-radius: 50%;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: #8B4513;
                }
            }

            .user-level {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                z-index: 1;

                .level-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    background: rgba(255, 215, 0, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    color: #FFD700;
                    font-weight: 700;
                    font-size: 0.95rem;
                    backdrop-filter: blur(10px);

                    i {
                        font-size: 1rem;
                    }
                }

                .exp-bar {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;

                    .exp-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #FFD700, #FFA500);
                        border-radius: 4px;
                        transition: width 0.5s ease;
                        box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                    }
                }

                .exp-text {
                    text-align: center;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 600;
                }
            }
        }

        /* Menu Items */
        .layout-menu {
            list-style: none;
            margin: 0;
            padding: 0;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;

            &::-webkit-scrollbar {
                width: 6px;
            }

            &::-webkit-scrollbar-track {
                background: transparent;
            }

            &::-webkit-scrollbar-thumb {
                background: rgba(139, 69, 19, 0.2);
                border-radius: 3px;

                &:hover {
                    background: rgba(139, 69, 19, 0.3);
                }
            }
        }

        .menu-category {
            margin-bottom: 1.5rem;

            .category-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem 0.75rem;
                margin-bottom: 0.5rem;
                font-weight: 700;
                font-size: 0.85rem;
                color: #8B4513;
                text-transform: uppercase;
                letter-spacing: 0.5px;

                .category-icon {
                    font-size: 1.2rem;
                }

                .category-label {
                    flex: 1;
                }
            }

            .category-items {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
        }

        .menu-item {
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: linear-gradient(135deg, #8B4513, #FFD700);
                transform: translateX(-4px);
                transition: transform 0.3s ease;
            }

            &:hover:not(.disabled) {
                background: rgba(139, 69, 19, 0.05);
                transform: translateX(4px);

                &::before {
                    transform: translateX(0);
                }

                .item-icon-wrapper {
                    background: linear-gradient(135deg, #8B4513, #654321);

                    i {
                        color: white;
                        transform: scale(1.1);
                    }
                }
            }

            &.active-item {
                background: linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(255, 215, 0, 0.1));
                border-left: 4px solid #8B4513;

                .item-icon-wrapper {
                    background: linear-gradient(135deg, #8B4513, #654321);

                    i {
                        color: white;
                    }
                }

                .item-label {
                    color: #8B4513;
                    font-weight: 700;
                }
            }

            &.disabled {
                opacity: 0.5;
                cursor: not-allowed;

                .item-content {
                    pointer-events: none;
                }
            }

            .item-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                text-decoration: none;
                color: inherit;

                .item-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(139, 69, 19, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.3s ease;

                    i {
                        font-size: 1.25rem;
                        color: #8B4513;
                        transition: all 0.3s ease;
                    }
                }

                .item-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;

                    .item-label {
                        font-weight: 600;
                        font-size: 0.95rem;
                        color: #333;
                        transition: all 0.3s ease;
                    }

                    .item-description {
                        font-size: 0.75rem;
                        color: #999;
                        line-height: 1.3;
                    }
                }

                .item-badge {
                    ::ng-deep .p-badge {
                        font-size: 0.7rem;
                        min-width: 1.5rem;
                        height: 1.5rem;
                    }
                }

                .item-lock {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(139, 69, 19, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    i {
                        font-size: 0.8rem;
                        color: #8B4513;
                    }
                }
            }
        }

        .menu-separator {
            margin: 1rem 0;

            .separator-line {
                height: 1px;
                background: linear-gradient(
                    to right,
                    transparent,
                    rgba(139, 69, 19, 0.2),
                    transparent
                );
            }
        }

        /* Quick Stats */
        .menu-quick-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(255, 215, 0, 0.05));
            border-radius: 12px;
            margin-top: auto;

            .stat-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

                i {
                    font-size: 1.5rem;
                    color: #8B4513;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;

                    .stat-value {
                        font-size: 1rem;
                        font-weight: 700;
                        color: #8B4513;
                        line-height: 1;
                    }

                    .stat-label {
                        font-size: 0.7rem;
                        color: #999;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                }
            }
        }

        /* Responsive */
        @media (max-width: 991px) {
            .layout-menu-container {
                padding: 1rem;
            }

            .menu-user-card {
                padding: 1rem;

                .user-avatar {
                    width: 60px;
                    height: 60px;

                    i {
                        font-size: 1.5rem;
                    }
                }
            }
        }
    `]
})
export class AppMenu implements OnInit {
    model: any[] = [];
    private estadisticasService = inject(EstadisticasService);
    private sesionService = inject(SesionService);
    private partidaService = inject(PartidaService);
    nivel: number = 1;
    xp: number = 1;
    partidas: number = 0;
    ranking: number = 0;
    ngOnInit() {
        const usuario = this.sesionService.getUsuario();

        if (!usuario) {
            console.warn('⚠️ No se encontró sesión de usuario');
            return;
        }

        // 1. Cargar Estadísticas Detalladas
        this.estadisticasService.obtenerEstadisticasDetalladas(usuario.id)
            .pipe()
            .subscribe({
                next: (data) => {
                    this.nivel = data.resumenGeneral.nivelFavorito?.length || 1;
                    this.xp = data.resumenGeneral.puntuacionTotal;
                    this.partidas = data.resumenGeneral.totalPartidas;
                },
                error: (err) => console.error('❌ Error Stats:', err)
            });

        // 2. Cargar Ranking Global
        this.partidaService.obtenerRankingGlobal()
            .pipe()
            .subscribe({
                next: (data) => {
                    // Normalización de tipos (String)
                    const index = data.findIndex(u => String(u.jugadorId) === String(usuario.id));
                    this.ranking = index >= 0 ? index + 1 : 0;
                },
                error: (err) => console.error('❌ Error Ranking:', err)
            });
        this.model = [
            {
                emoji: '🏠',
                label: 'Panel de Control',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-home',
                        routerLink: '/',
                        description: 'Vista general de tu progreso',
                        badge: null
                    }
                ]
            },
            {
                separator: true
            },
            {
                emoji: '🎮',
                label: 'Juegos Culturales',
                items: [
                    {
                        label: 'Memoria Cultural',
                        icon: 'pi pi-th-large',
                        routerLink: '/juegos/memoria-cultural',
                        description: 'Encuentra parejas culturales',
                        badge: 'NUEVO',
                        badgeSeverity: 'success'
                    },
                    {
                        label: 'Rompecabezas',
                        icon: 'pi pi-map',
                        routerLink: '/juegos/rompe-cabezas',
                        description: 'Descubre el rompecabezas',
                        disabled: false,
                        tooltip: 'Juegalo ya!'
                    },
                    {
                        label: 'Exploración Ingapirca',
                        icon: 'pi pi-map',
                        routerLink: '/juegos/exploracion',
                        description: 'Descubre el sitio arqueológico',
                        disabled: false,
                        tooltip: 'Próximamente disponible'
                    },

                ]
            },
            {
                separator: true
            },
            {
                emoji: '📊',
                label: 'Tu Progreso',
                items: [
                    {
                        label: 'Mis Estadísticas',
                        icon: 'pi pi-chart-bar',
                        routerLink: '/juegos/estadisticas',
                        description: 'Ve tu rendimiento',
                        badge: null
                    },
                    {
                        label: 'Clasificación',
                        icon: 'pi pi-trophy',
                        routerLink: '/juegos/ranking',
                        description: 'Compite con otros',
                        badge: '#23',
                        badgeSeverity: 'warning'
                    }
                ]
            }
        ];
    }
}
