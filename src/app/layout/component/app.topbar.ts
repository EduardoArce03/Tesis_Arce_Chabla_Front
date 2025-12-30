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
                    <!-- Logo UPS simplificado -->
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
            <div class="layout-topbar-actions">
                <!-- Información del Usuario -->
                <div class="usuario-info" *ngIf="usuario">
                    <div class="usuario-avatar">
                        <p-avatar
                            [label]="getIniciales(usuario.nombre)"
                            shape="circle"
                            [style]="{'background-color':'#8B4513', 'color': '#ffffff'}"
                            size="large">
                        </p-avatar>
                    </div>

                    <div class="usuario-detalles">
                        <span class="usuario-nombre">{{ usuario.nombre }}</span>
                        <span class="usuario-codigo" pTooltip="Código de Jugador" tooltipPosition="bottom">
                            <i class="pi pi-id-card"></i>
                            {{ usuario.codigoJugador }}
                        </span>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="layout-config-menu">
                    <!-- Modo Oscuro -->
                    <button
                        type="button"
                        class="layout-topbar-action"
                        (click)="toggleDarkMode()"
                        pTooltip="Cambiar tema"
                        tooltipPosition="bottom">
                        <i [ngClass]="{
                            'pi': true,
                            'pi-moon': layoutService.isDarkTheme(),
                            'pi-sun': !layoutService.isDarkTheme()
                        }"></i>
                    </button>

                    <!-- Configurador de Temas -->
                    <div class="relative">
                        <button
                            class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                            pTooltip="Personalizar colores"
                            tooltipPosition="bottom">
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator />
                    </div>

                    <!-- Cerrar Sesión -->
                    <button
                        type="button"
                        class="layout-topbar-action cerrar-sesion"
                        (click)="cerrarSesion()"
                        *ngIf="usuario"
                        pTooltip="Cerrar sesión"
                        tooltipPosition="bottom">
                        <i class="pi pi-sign-out"></i>
                    </button>
                </div>

                <!-- Menú Mobile -->
                <button
                    class="layout-topbar-menu-button layout-topbar-action"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <!-- Menú Desktop -->
                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button
                            type="button"
                            class="layout-topbar-action"
                            routerLink="/juegos/estadisticas">
                            <i class="pi pi-chart-bar"></i>
                            <span>Estadísticas</span>
                        </button>
                        <button
                            type="button"
                            class="layout-topbar-action"
                            routerLink="/juegos/ranking">
                            <i class="pi pi-trophy"></i>
                            <span>Ranking</span>
                        </button>
                        <button
                            type="button"
                            class="layout-topbar-action"
                            *ngIf="usuario">
                            <i class="pi pi-user"></i>
                            <span>{{ usuario.nombre }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .layout-topbar {
            background: linear-gradient(135deg, #8B4513 0%, #654321 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .layout-topbar-logo-container {
                .layout-topbar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;

                    .ups-logo {
                        width: 45px;
                        height: 45px;
                        background: white;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

                        i {
                            font-size: 1.8rem;
                            color: #8B4513;
                        }
                    }

                    .logo-text {
                        display: flex;
                        flex-direction: column;

                        .universidad {
                            font-size: 1.5rem;
                            font-weight: 700;
                            color: white;
                            line-height: 1.2;
                            letter-spacing: 2px;
                        }

                        .subtitulo {
                            font-size: 0.75rem;
                            color: rgba(255, 255, 255, 0.9);
                            font-weight: 500;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                    }
                }
            }

            .layout-topbar-actions {
                .usuario-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50px;
                    margin-right: 1rem;
                    backdrop-filter: blur(10px);

                    .usuario-detalles {
                        display: flex;
                        flex-direction: column;

                        .usuario-nombre {
                            font-weight: 600;
                            color: white;
                            font-size: 0.95rem;
                        }

                        .usuario-codigo {
                            font-size: 0.75rem;
                            color: rgba(255, 255, 255, 0.8);
                            font-family: 'Courier New', monospace;
                            display: flex;
                            align-items: center;
                            gap: 0.25rem;

                            i {
                                font-size: 0.7rem;
                            }
                        }
                    }
                }

                .layout-config-menu {
                    .layout-topbar-action {
                        color: white;

                        &.cerrar-sesion {
                            background: rgba(255, 59, 48, 0.2);

                            &:hover {
                                background: rgba(255, 59, 48, 0.3);
                            }
                        }

                        &:hover {
                            background: rgba(255, 255, 255, 0.1);
                        }
                    }
                }
            }

            // Override para botones del menú
            .layout-menu-button {
                color: white;

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            }

            .layout-topbar-menu {
                .layout-topbar-menu-content {
                    button {
                        color: white;

                        &:hover {
                            background: rgba(255, 255, 255, 0.1);
                        }
                    }
                }
            }
        }

        // Responsive
        @media (max-width: 991px) {
            .layout-topbar {
                .layout-topbar-actions {
                    .usuario-info {
                        padding: 0.5rem;
                        margin-right: 0.5rem;

                        .usuario-detalles {
                            display: none;
                        }
                    }
                }
            }
        }

        @media (max-width: 575px) {
            .layout-topbar {
                .layout-topbar-logo-container {
                    .layout-topbar-logo {
                        .logo-text {
                            .subtitulo {
                                display: none;
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
        // Suscribirse a cambios en el usuario
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

    /**
     * Obtener iniciales del nombre para el avatar
     */
    getIniciales(nombre: string): string {
        if (!nombre) return '?';

        const palabras = nombre.trim().split(' ');
        if (palabras.length === 1) {
            return palabras[0].substring(0, 2).toUpperCase();
        }

        return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
    }

    /**
     * Cerrar sesión
     */
    cerrarSesion() {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            this.sesionService.cerrarSesion();
            this.router.navigate(['/bienvenida']);
        }
    }
}
