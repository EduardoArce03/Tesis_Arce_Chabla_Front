import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Carousel } from 'primeng/carousel';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';

interface Mission {
    name: string;
    image: string;
    description: string;
}

@Component({
    selector: 'app-game',
    template: `
        <div class="home-container">
            <!-- Fondo con paisaje Inca-Cañari -->
            <div class="hero-section">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <!-- Logo y Título -->
                    <div class="title-section">
                        <h1 class="game-title">
                            <i class="pi pi-sun"></i>
                            InkaCañari Quest
                        </h1>
                        <p class="subtitle">Descubre los secretos de las culturas ancestrales</p>
                    </div>

                    <!-- Botón principal -->
                    <div class="main-action">
                        <p-button label="Comenzar Aventura" icon="pi pi-compass" styleClass="p-button-lg p-button-warning main-button" (onClick)="startAdventure()"> </p-button>
                    </div>

                    <!-- Botones secundarios -->
                    <div class="secondary-actions">
                        <p-button label="Login" icon="pi pi-sign-in" styleClass="p-button-outlined p-button-secondary" (onClick)="openLogin()"> </p-button>
                        <p-button label="Registro" icon="pi pi-user-plus" styleClass="p-button-outlined p-button-secondary" (onClick)="openRegister()"> </p-button>
                    </div>
                </div>
            </div>

            <!-- Sección de misiones destacadas -->
            <div class="missions-section">
                <h2 class="section-title">
                    <i class="pi pi-map-marker"></i>
                    Misiones Destacadas
                </h2>

                <p-carousel [value]="missions" [numVisible]="3" [numScroll]="1" [circular]="true" [responsiveOptions]="responsiveOptions" [autoplayInterval]="5000">
                    <ng-template let-mission pTemplate="item">
                        <div class="mission-card" (click)="selectMission(mission)">
                            <p-card>
                                <ng-template pTemplate="header">
                                    <img [alt]="mission.name" [src]="mission.image" class="mission-image" onError="this.src='assets/imgs/placeholder.png'" />
                                </ng-template>
                                <div class="mission-info">
                                    <h3>{{ mission.name }}</h3>
                                    <p>{{ mission.description }}</p>
                                </div>
                                <ng-template pTemplate="footer">
                                    <p-button label="Explorar" icon="pi pi-arrow-right" styleClass="p-button-sm p-button-text"> </p-button>
                                </ng-template>
                            </p-card>
                        </div>
                    </ng-template>
                </p-carousel>
            </div>

            <!-- Barra de estadísticas del usuario -->
            <div class="stats-section">
                <p-card styleClass="stats-card">
                    <div class="stats-container">
                        <div class="stat-item">
                            <i class="pi pi-star-fill stat-icon"></i>
                            <div class="stat-info">
                                <span class="stat-label">Nivel</span>
                                <span class="stat-value">{{ userLevel }}</span>
                            </div>
                        </div>

                        <p-divider layout="vertical"></p-divider>

                        <div class="stat-item">
                            <i class="pi pi-trophy stat-icon"></i>
                            <div class="stat-info">
                                <span class="stat-label">Puntos</span>
                                <span class="stat-value">{{ userPoints }}</span>
                            </div>
                        </div>

                        <p-divider layout="vertical"></p-divider>

                        <div class="stat-item">
                            <i class="pi pi-shield stat-icon"></i>
                            <div class="stat-info">
                                <span class="stat-label">Insignias</span>
                                <span class="stat-value">{{ userBadges }}</span>
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>
    `,
    imports: [Card, Divider, Carousel, Button, PrimeTemplate],
    standalone: true,
    providers: [],
    styles: [`
          .mission-image {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
          }
        `]
})
export class Game {
    missions: Mission[] = [
        {
            name: 'Cusco',
            image: '/imgs/cusco.png',
            description: 'Explora la capital del imperio Inca'
        },
        {
            name: 'Ingapirca',
            image: '/imgs/ingapirca.png',
            description: 'Descubre el templo del sol Cañari'
        },
        {
            name: 'Tomebamba',
            image: '/imgs/tomebamba.png',
            description: 'Visita la antigua ciudad de Tomebamba'
        }
    ];

    userLevel: number = 0;
    userPoints: number = 0;
    userBadges: number = 0;

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    ngOnInit() {
        // Cargar datos del usuario si existen
        this.loadUserData();
    }

    startAdventure() {
        console.log('Comenzar aventura');
        // Navegar a la pantalla de juego
    }

    openLogin() {
        console.log('Abrir login');
        // Abrir modal de login
    }

    openRegister() {
        console.log('Abrir registro');
        // Abrir modal de registro
    }

    selectMission(mission: Mission) {
        console.log('Misión seleccionada:', mission.name);
        // Navegar a la misión seleccionada
    }

    loadUserData() {
        // Simular carga de datos del usuario
        // En producción, esto vendría de un servicio
    }
}
