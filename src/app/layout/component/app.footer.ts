import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-footer',
    imports: [CommonModule, RouterModule],
    template: `
        <footer class="layout-footer">
            <div class="footer-container">
                <!-- Sección Principal -->
                <div class="footer-main">
                    <div class="footer-brand">
                        <div class="brand-logo">
                            <i class="pi pi-graduation-cap"></i>
                        </div>
                        <h3 class="brand-title">Sistema de Aprendizaje Cultural</h3>
                        <p class="brand-description">
                            Descubre y aprende sobre las culturas Inca y Cañari
                            a través de experiencias interactivas de gamificación
                        </p>
                        <div class="ups-badge">
                            <span class="ups-text">Universidad Politécnica Salesiana</span>
                            <span class="ups-location">Ecuador</span>
                        </div>
                    </div>

                    <div class="footer-links">
                        <div class="link-group">
                            <h4>🎮 Juegos</h4>
                            <a routerLink="/juegos/memoria-cultural">Memoria Cultural</a>
                            <a routerLink="/juegos/misiones">Misiones Educativas</a>
                            <a routerLink="/juegos/exploracion">Exploración Ingapirca</a>
                        </div>

                        <div class="link-group">
                            <h4>📊 Tu Progreso</h4>
                            <a routerLink="/juegos/estadisticas">Mis Estadísticas</a>
                            <a routerLink="/juegos/ranking">Tabla de Clasificación</a>
                            <a routerLink="/">Panel de Control</a>
                        </div>

                        <div class="link-group">
                            <h4>📚 Recursos</h4>
                            <a href="#" (click)="$event.preventDefault()">Sobre las Culturas</a>
                            <a href="#" (click)="$event.preventDefault()">Guía de Uso</a>
                            <a href="#" (click)="$event.preventDefault()">Preguntas Frecuentes</a>
                        </div>
                    </div>
                </div>

                <!-- Stats Rápidos -->
                <div class="footer-stats">
                    <div class="stat-item">
                        <i class="pi pi-users"></i>
                        <div class="stat-info">
                            <span class="stat-label">Jugadores Activos</span>
                            <span class="stat-value">{{ totalJugadores }}+</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="pi pi-play-circle"></i>
                        <div class="stat-info">
                            <span class="stat-label">Partidas Jugadas</span>
                            <span class="stat-value">{{ totalPartidas }}+</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="pi pi-star-fill"></i>
                        <div class="stat-info">
                            <span class="stat-label">Elementos Culturales</span>
                            <span class="stat-value">48</span>
                        </div>
                    </div>
                </div>

                <!-- Divisor -->
                <div class="footer-divider"></div>

                <!-- Sección Inferior -->
                <div class="footer-bottom">
                    <div class="footer-copyright">
                        <p class="main-copyright">
                            © {{ currentYear }} Universidad Politécnica Salesiana
                        </p>
                        <p class="thesis-info">
                            Proyecto de Tesis - Carrera de Computación
                        </p>
                        <p class="powered-by">
                            Desarrollado con
                            <span class="heart">♥</span>
                            usando
                            <a href="https://angular.dev" target="_blank" rel="noopener noreferrer" class="tech-link">Angular</a>
                            +
                            <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="tech-link">PrimeNG</a>
                            +
                            <a href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener noreferrer" class="tech-link">Spring Boot</a>
                        </p>
                    </div>

                    <div class="footer-cultural">
                        <div class="cultural-symbols">
                            <span class="symbol" title="Chakana - Cruz Andina">✦</span>
                            <span class="symbol" title="Inti - Sol">☀</span>
                            <span class="symbol" title="Killa - Luna">☾</span>
                        </div>
                        <p class="cultural-text">Preservando nuestra herencia cultural</p>
                    </div>
                </div>
            </div>
        </footer>
    `,
    styles: [`
        .layout-footer {
            background: linear-gradient(135deg, #8B4513 0%, #654321 100%);
            color: #ffffff;
            padding: 0;
            margin-top: auto;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        }

        .footer-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 3rem 2rem 1.5rem;
        }

        /* Sección Principal */
        .footer-main {
            display: grid;
            grid-template-columns: 1.5fr 2fr;
            gap: 4rem;
            margin-bottom: 3rem;
        }

        .footer-brand {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            .brand-logo {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 0.5rem;
                backdrop-filter: blur(10px);

                i {
                    font-size: 2rem;
                    color: #FFD700;
                }
            }

            .brand-title {
                font-size: 1.75rem;
                font-weight: 700;
                margin: 0;
                color: #ffffff;
                line-height: 1.3;
            }

            .brand-description {
                color: rgba(255, 255, 255, 0.85);
                font-size: 0.95rem;
                margin: 0;
                line-height: 1.6;
            }

            .ups-badge {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                border-left: 4px solid #FFD700;
                margin-top: 0.5rem;

                .ups-text {
                    font-weight: 600;
                    color: #FFD700;
                    font-size: 0.95rem;
                }

                .ups-location {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.7);
                }
            }
        }

        .footer-links {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2.5rem;
        }

        .link-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;

            h4 {
                font-size: 1.1rem;
                font-weight: 600;
                margin: 0 0 0.5rem 0;
                color: #FFD700;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            a {
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                position: relative;
                width: fit-content;
                padding-left: 1rem;

                &::before {
                    content: '▸';
                    position: absolute;
                    left: 0;
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                &:hover {
                    color: #ffffff;
                    padding-left: 1.5rem;

                    &::before {
                        opacity: 1;
                    }
                }
            }
        }

        /* Stats Rápidos */
        .footer-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-bottom: 2rem;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            backdrop-filter: blur(10px);

            .stat-item {
                display: flex;
                align-items: center;
                gap: 1rem;

                i {
                    font-size: 2.5rem;
                    color: #FFD700;
                    flex-shrink: 0;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;

                    .stat-label {
                        font-size: 0.8rem;
                        color: rgba(255, 255, 255, 0.7);
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .stat-value {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #ffffff;
                    }
                }
            }
        }

        /* Divisor */
        .footer-divider {
            height: 1px;
            background: linear-gradient(
                    to right,
                    transparent,
                    rgba(255, 215, 0, 0.3),
                    transparent
            );
            margin: 2rem 0;
        }

        /* Sección Inferior */
        .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 2rem;
        }

        .footer-copyright {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            p {
                margin: 0;
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.8);
            }

            .main-copyright {
                font-weight: 600;
                color: #ffffff;
            }

            .thesis-info {
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.7);
            }

            .powered-by {
                display: flex;
                align-items: center;
                gap: 0.35rem;
                flex-wrap: wrap;
                margin-top: 0.5rem;
            }

            .heart {
                color: #ff6b9d;
                animation: heartbeat 1.5s ease-in-out infinite;
            }

            @keyframes heartbeat {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
            }

            .tech-link {
                color: #FFD700;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.3s ease;
                position: relative;

                &:hover {
                    color: #ffffff;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                }
            }
        }

        /* Símbolos Culturales */
        .footer-cultural {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.75rem;

            .cultural-symbols {
                display: flex;
                gap: 1rem;

                .symbol {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255, 215, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: #FFD700;
                    transition: all 0.3s ease;
                    cursor: help;

                    &:hover {
                        background: rgba(255, 215, 0, 0.25);
                        transform: rotate(360deg) scale(1.1);
                    }
                }
            }

            .cultural-text {
                margin: 0;
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.7);
                font-style: italic;
            }
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .footer-main {
                grid-template-columns: 1fr;
                gap: 2.5rem;
            }

            .footer-stats {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 968px) {
            .footer-links {
                grid-template-columns: repeat(2, 1fr);
            }

            .footer-stats {
                padding: 1.5rem;

                .stat-item {
                    i {
                        font-size: 2rem;
                    }

                    .stat-info .stat-value {
                        font-size: 1.25rem;
                    }
                }
            }
        }

        @media (max-width: 640px) {
            .footer-container {
                padding: 2rem 1rem 1rem;
            }

            .footer-links {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .footer-bottom {
                flex-direction: column;
                align-items: flex-start;
                gap: 1.5rem;
            }

            .footer-cultural {
                width: 100%;
                align-items: center;

                .cultural-symbols {
                    justify-content: center;
                }

                .cultural-text {
                    text-align: center;
                }
            }

            .footer-stats {
                .stat-item {
                    flex-direction: column;
                    text-align: center;
                }
            }
        }
    `]
})
export class AppFooter {
    currentYear = new Date().getFullYear();
    totalJugadores = 150;  // Puedes hacer esto dinámico con un servicio
    totalPartidas = 500;   // Puedes hacer esto dinámico con un servicio
}
