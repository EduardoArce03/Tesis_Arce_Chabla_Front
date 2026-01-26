import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { SesionService } from '../../services/sesion.service';
import { Usuario } from '../../models/usuario.model';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        StyleClassModule,
        AppConfigurator,
        ButtonModule,
        AvatarModule,
        BadgeModule,
        TooltipModule
    ],
    template: `
        <div class="layout-topbar">
            <!-- Logo y Universidad -->
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <div class="ups-logo">
                        <i class="pi pi-graduation-cap"></i>
                    </div>
                    <div class="logo-text">
                        <span class="universidad">UPS</span>
                        <span class="subtitulo">Cultura Andina</span>
                    </div>
                </a>
            </div>

            <!-- Acciones del Topbar -->
            <div class="layout-topbar-actions" *ngIf="usuario">
                <!-- Información del Usuario -->
                <div class="usuario-info">
                    <div class="usuario-detalles">
                        <span class="usuario-nombre">{{ usuario.nombre }}</span>
                        <span class="usuario-codigo" pTooltip="Código de Jugador" tooltipPosition="bottom">
                            <i class="pi pi-id-card"></i>
                            {{ usuario.codigoJugador }}
                        </span>
                    </div>

                    <div class="usuario-avatar">
                        <p-avatar
                            [label]="getIniciales(usuario.nombre)"
                            shape="circle"
                            [style]="{'background-color':'#ffffff', 'color': '#8B4513'}"
                            size="large">
                        </p-avatar>
                    </div>
                </div>

                <!-- Botón Cerrar Sesión -->
                <button
                    type="button"
                    class="layout-topbar-action btn-cerrar-sesion"
                    (click)="cerrarSesion()"
                    pTooltip="Cerrar sesión"
                    tooltipPosition="bottom">
                    <i class="pi pi-sign-out"></i>
                </button>
            </div>
        </div>
    `,
    styles: [`
        .layout-topbar {
            background: linear-gradient(135deg, #8B4513 0%, #654321 100%);
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
            padding: 0.75rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;

            // ==================== LOGO ====================
            .layout-topbar-logo-container {
                display: flex;
                align-items: center;
                gap: 1rem;

                .layout-menu-button {
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    i {
                        font-size: 1.2rem;
                    }

                    &:hover {
                        background: rgba(255, 255, 255, 0.2);
                        transform: scale(1.05);
                    }
                }

                .layout-topbar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    transition: opacity 0.2s ease;

                    &:hover {
                        opacity: 0.9;
                    }

                    .ups-logo {
                        width: 48px;
                        height: 48px;
                        background: white;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

                        i {
                            font-size: 2rem;
                            color: #8B4513;
                        }
                    }

                    .logo-text {
                        display: flex;
                        flex-direction: column;
                        gap: 0.1rem;

                        .universidad {
                            font-size: 1.6rem;
                            font-weight: 800;
                            color: white;
                            line-height: 1;
                            letter-spacing: 2px;
                        }

                        .subtitulo {
                            font-size: 0.7rem;
                            color: rgba(255, 255, 255, 0.85);
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 1.5px;
                        }
                    }
                }
            }

            // ==================== ACCIONES ====================
            .layout-topbar-actions {
                display: flex;
                align-items: center;
                gap: 1rem;

                .usuario-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.5rem 1.25rem;
                    background: rgba(255, 255, 255, 0.12);
                    border-radius: 50px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    transition: all 0.2s ease;

                    &:hover {
                        background: rgba(255, 255, 255, 0.18);
                        border-color: rgba(255, 255, 255, 0.25);
                    }

                    .usuario-detalles {
                        display: flex;
                        flex-direction: column;
                        gap: 0.15rem;

                        .usuario-nombre {
                            font-weight: 700;
                            color: white;
                            font-size: 0.95rem;
                            line-height: 1.2;
                        }

                        .usuario-codigo {
                            font-size: 0.7rem;
                            color: rgba(255, 255, 255, 0.75);
                            font-family: 'Courier New', monospace;
                            display: flex;
                            align-items: center;
                            gap: 0.3rem;
                            font-weight: 500;

                            i {
                                font-size: 0.65rem;
                            }
                        }
                    }

                    .usuario-avatar {
                        ::ng-deep .p-avatar {
                            width: 44px;
                            height: 44px;
                            font-size: 1.1rem;
                            font-weight: 700;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            border: 2px solid rgba(255, 255, 255, 0.3);
                        }
                    }
                }

                .btn-cerrar-sesion {
                    width: 2.75rem;
                    height: 2.75rem;
                    border-radius: 50%;
                    background: rgba(255, 59, 48, 0.2);
                    border: 1px solid rgba(255, 59, 48, 0.3);
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    i {
                        font-size: 1.1rem;
                    }

                    &:hover {
                        background: rgba(255, 59, 48, 0.35);
                        border-color: rgba(255, 59, 48, 0.5);
                        transform: scale(1.05);
                    }

                    &:active {
                        transform: scale(0.95);
                    }
                }
            }
        }

        // ==================== RESPONSIVE ====================
        @media (max-width: 991px) {
            .layout-topbar {
                padding: 0.75rem 1rem;

                .layout-topbar-actions {
                    gap: 0.75rem;

                    .usuario-info {
                        padding: 0.5rem;

                        .usuario-detalles {
                            display: none;
                        }
                    }

                    .btn-cerrar-sesion {
                        width: 2.5rem;
                        height: 2.5rem;
                    }
                }
            }
        }

        @media (max-width: 575px) {
            .layout-topbar {
                padding: 0.5rem 0.75rem;

                .layout-topbar-logo-container {
                    gap: 0.5rem;

                    .layout-topbar-logo {
                        .ups-logo {
                            width: 40px;
                            height: 40px;

                            i {
                                font-size: 1.6rem;
                            }
                        }

                        .logo-text {
                            .universidad {
                                font-size: 1.3rem;
                            }

                            .subtitulo {
                                display: none;
                            }
                        }
                    }
                }

                .layout-topbar-actions {
                    .usuario-info {
                        .usuario-avatar {
                            ::ng-deep .p-avatar {
                                width: 38px;
                                height: 38px;
                                font-size: 0.95rem;
                            }
                        }
                    }
                }
            }
        }
    `]
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    usuario: Usuario | null = null;

    constructor(
        public layoutService: LayoutService,
        private sesionService: SesionService,
        private router: Router
    ) {}

    ngOnInit() {
        this.sesionService.usuario$.subscribe(usuario => {
            this.usuario = usuario;
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    getIniciales(nombre: string): string {
        if (!nombre) return '?';

        const palabras = nombre.trim().split(' ');
        if (palabras.length === 1) {
            return palabras[0].substring(0, 2).toUpperCase();
        }

        return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
    }

    cerrarSesion() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            this.sesionService.cerrarSesion();
            this.router.navigate(['/bienvenida']);
        }
    }
}
