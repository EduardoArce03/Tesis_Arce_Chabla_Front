import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { RankingResponse, NivelDificultad, CategoriasCultural } from '@/models/juego.model';
import { PartidaService } from '@/components/partida.service';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, Card, Tag, Select, TableModule],
    selector: 'app-ranking',
    template: `
        <div class="ranking-wrapper">
            <!-- Header -->
            <div class="ranking-header">
                <div class="header-content">
                    <div class="trophy-icon">🏆</div>
                    <h1 class="title">Salón de la Fama</h1>
                    <p class="subtitle">Los mejores exploradores culturales</p>
                </div>
                <div class="stats-quick">
                    <div class="stat-item">
                        <span class="stat-value">{{ ranking.length }}</span>
                        <span class="stat-label">Jugadores</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{{ obtenerMejorPuntuacion() }}</span>
                        <span class="stat-label">Mejor Puntaje</span>
                    </div>
                </div>
            </div>

            <!-- Filtros -->
            <div class="filtros-section">
                <div class="filtros-container">
                    <div class="filtro-item">
                        <label>
                            <i class="pi pi-sliders-h"></i>
                            Nivel de Dificultad
                        </label>
                        <p-select
                            [options]="nivelesOpciones"
                            [(ngModel)]="nivelFiltro"
                            (onChange)="cargarRanking()"
                            placeholder="Todos los niveles"
                            [showClear]="true"
                            [style]="{'width':'100%'}">
                        </p-select>
                    </div>

                    <div class="filtro-item">
                        <label>
                            <i class="pi pi-bookmark"></i>
                            Categoría Cultural
                        </label>
                        <p-select
                            [options]="categoriasOpciones"
                            [(ngModel)]="categoriaFiltro"
                            (onChange)="cargarRanking()"
                            placeholder="Todas las categorías"
                            [showClear]="true"
                            [style]="{'width':'100%'}">
                        </p-select>
                    </div>
                </div>
            </div>

            <!-- Podio Top 3 -->
            <div class="podio-section" *ngIf="ranking.length >= 1">
                <div class="podio-container">
                    <!-- Segundo Lugar -->
                    <div class="podio-card segundo" *ngIf="ranking.length >= 2 && ranking[1]">
                        <div class="podio-rank">2</div>
                        <div class="podio-medal">🥈</div>
                        <div class="podio-player">
                            <div class="player-avatar silver">{{ obtenerIniciales(ranking[1].nombreJugador) }}</div>
                            <h3>{{ ranking[1].nombreJugador }}</h3>
                        </div>
                        <div class="podio-score">
                            <span class="score-value">{{ ranking[1].puntuacion }}</span>
                            <span class="score-label">puntos</span>
                        </div>
                        <div class="podio-details">
                            <span class="detail-badge">{{ getNivelLabel(ranking[1].nivel) }}</span>
                            <span class="detail-time">{{ formatearTiempo(ranking[1].tiempoSegundos) }}</span>
                        </div>
                    </div>

                    <!-- Primer Lugar -->
                    <div class="podio-card primero" *ngIf="ranking[0]">
                        <div class="podio-crown">👑</div>
                        <div class="podio-rank">1</div>
                        <div class="podio-medal">🥇</div>
                        <div class="podio-player">
                            <div class="player-avatar gold">{{ obtenerIniciales(ranking[0].jugadorId) }}</div>
                            <h3>{{ ranking[0].nombreJugador }}</h3>
                        </div>
                        <div class="podio-score">
                            <span class="score-value">{{ ranking[0].puntuacion }}</span>
                            <span class="score-label">puntos</span>
                        </div>
                        <div class="podio-details">
                            <span class="detail-badge">{{ getNivelLabel(ranking[0].nivel) }}</span>
                            <span class="detail-time">{{ formatearTiempo(ranking[0].tiempoSegundos) }}</span>
                        </div>
                    </div>

                    <!-- Tercer Lugar -->
                    <div class="podio-card tercero" *ngIf="ranking.length >= 3 && ranking[2]">
                        <div class="podio-rank">3</div>
                        <div class="podio-medal">🥉</div>
                        <div class="podio-player">
                            <div class="player-avatar bronze">{{ obtenerIniciales(ranking[2].jugadorId) }}</div>
                            <h3>{{ ranking[2].nombreJugador }}</h3>
                        </div>
                        <div class="podio-score">
                            <span class="score-value">{{ ranking[2].puntuacion }}</span>
                            <span class="score-label">puntos</span>
                        </div>
                        <div class="podio-details">
                            <span class="detail-badge">{{ getNivelLabel(ranking[2].nivel) }}</span>
                            <span class="detail-time">{{ formatearTiempo(ranking[2].tiempoSegundos) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla (solo si hay más de 3) -->
            <div class="tabla-section" *ngIf="ranking.length > 3">
                <div class="tabla-header">
                    <h2>Clasificación Completa</h2>
                    <span class="total-count">{{ obtenerRankingTabla().length }} jugadores más</span>
                </div>

                <div class="tabla-container">
                    <p-table [value]="obtenerRankingTabla()">
                        <ng-template pTemplate="header">
                            <tr>
                                <th style="width: 80px">Pos.</th>
                                <th>Jugador</th>
                                <th style="width: 130px">Puntuación</th>
                                <th style="width: 110px">Nivel</th>
                                <th style="width: 140px">Categoría</th>
                                <th style="width: 100px">Tiempo</th>
                                <th style="width: 120px">Fecha</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-item let-i="rowIndex">
                            <tr class="ranking-row">
                                <td>
                                    <div class="position-badge">
                                        <span class="position-number">#{{ i + 4 }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="player-cell">
                                        <div class="player-avatar-mini">{{ obtenerIniciales(item.jugadorId) }}</div>
                                        <span class="player-name">{{ item.nombreJugador }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="score-cell">
                                        <i class="pi pi-star-fill"></i>
                                        <span>{{ item.puntuacion }}</span>
                                    </div>
                                </td>
                                <td>
                                    <p-tag [value]="getNivelLabel(item.nivel)" [severity]="getNivelSeverity(item.nivel)"></p-tag>
                                </td>
                                <td>
                  <span class="categoria-badge">
                    {{ obtenerEmojiCategoria(item.categoria) }}
                      {{ item.categoria }}
                  </span>
                                </td>
                                <td>
                  <span class="tiempo-badge">
                    <i class="pi pi-clock"></i>
                      {{ formatearTiempo(item.tiempoSegundos) }}
                  </span>
                                </td>
                                <td>
                                    <span class="fecha-text">{{ formatearFecha(item.fecha) }}</span>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>

            <!-- Estado vacío -->
            <div class="empty-state-global" *ngIf="ranking.length === 0">
                <div class="empty-animation">🎮</div>
                <h3>¡Sé el primero en el ranking!</h3>
                <p>Juega una partida y establece el récord</p>
            </div>
        </div>
    `,
    styles: [`
        .ranking-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8f4e6 0%, #e8dcc4 100%);
            padding: 2rem;
        }

        // ==================== HEADER ====================
        .ranking-header {
            background: white;
            border-radius: 20px;
            padding: 2.5rem 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

            .header-content {
                text-align: center;

                .trophy-icon {
                    font-size: 4rem;
                    animation: bounce 2s infinite;
                }

                .title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #8B4513;
                    margin: 1rem 0 0.5rem;
                }

                .subtitle {
                    font-size: 1.1rem;
                    color: #666;
                    margin: 0;
                }
            }

            .stats-quick {
                display: flex;
                justify-content: center;
                gap: 4rem;
                margin-top: 2rem;

                .stat-item {
                    text-align: center;

                    .stat-value {
                        display: block;
                        font-size: 2.5rem;
                        font-weight: 800;
                        color: #8B4513;
                    }

                    .stat-label {
                        display: block;
                        font-size: 0.9rem;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-top: 0.5rem;
                    }
                }
            }
        }

        // ==================== FILTROS ====================
        .filtros-section {
            margin-bottom: 2rem;

            .filtros-container {
                background: white;
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;

                .filtro-item {
                    label {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-weight: 700;
                        color: #8B4513;
                        margin-bottom: 0.75rem;
                        font-size: 1rem;
                    }
                }
            }
        }

        // ==================== PODIO ====================
        .podio-section {
            margin-bottom: 2rem;

            .podio-container {
                display: flex;
                justify-content: center;
                align-items: flex-end;
                gap: 1.5rem;
                max-width: 1200px;
                margin: 0 auto;

                .podio-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem 1.5rem;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    flex: 0 0 320px;

                    &:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
                    }

                    .podio-rank {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        width: 36px;
                        height: 36px;
                        background: rgba(139, 69, 19, 0.1);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 800;
                        font-size: 1.1rem;
                        color: #8B4513;
                    }

                    .podio-crown {
                        position: absolute;
                        top: -25px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 3rem;
                        animation: float 3s ease-in-out infinite;
                    }

                    .podio-medal {
                        font-size: 3.5rem;
                        margin-bottom: 1rem;
                    }

                    .podio-player {
                        margin-bottom: 1.5rem;

                        .player-avatar {
                            width: 70px;
                            height: 70px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.8rem;
                            font-weight: 800;
                            color: white;
                            margin: 0 auto 1rem;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

                            &.gold {
                                background: linear-gradient(135deg, #FFD700, #FFA500);
                            }

                            &.silver {
                                background: linear-gradient(135deg, #C0C0C0, #808080);
                            }

                            &.bronze {
                                background: linear-gradient(135deg, #CD7F32, #8B4513);
                            }
                        }

                        h3 {
                            margin: 0;
                            font-size: 1.2rem;
                            font-weight: 700;
                            color: #333;
                        }
                    }

                    .podio-score {
                        margin-bottom: 1rem;

                        .score-value {
                            display: block;
                            font-size: 2.2rem;
                            font-weight: 900;
                            color: #8B4513;
                        }

                        .score-label {
                            display: block;
                            font-size: 0.85rem;
                            color: #666;
                            text-transform: uppercase;
                        }
                    }

                    .podio-details {
                        display: flex;
                        justify-content: center;
                        gap: 0.75rem;
                        flex-wrap: wrap;

                        .detail-badge,
                        .detail-time {
                            background: #f0f0f0;
                            padding: 0.4rem 0.9rem;
                            border-radius: 16px;
                            font-size: 0.8rem;
                            font-weight: 600;
                            color: #666;
                        }
                    }

                    &.primero {
                        padding-top: 2.5rem;

                        &::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #FFD700, #FFA500);
                            border-radius: 20px 20px 0 0;
                        }
                    }

                    &.segundo {
                        &::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #C0C0C0, #808080);
                            border-radius: 20px 20px 0 0;
                        }
                    }

                    &.tercero {
                        &::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #CD7F32, #8B4513);
                            border-radius: 20px 20px 0 0;
                        }
                    }
                }
            }
        }

        // ==================== TABLA ====================
        .tabla-section {
            .tabla-header {
                background: white;
                border-radius: 16px 16px 0 0;
                padding: 1.5rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #e0e0e0;

                h2 {
                    margin: 0;
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #333;
                }

                .total-count {
                    background: linear-gradient(135deg, #8B4513, #654321);
                    color: white;
                    padding: 0.5rem 1.25rem;
                    border-radius: 16px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
            }

            .tabla-container {
                background: white;
                border-radius: 0 0 16px 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                overflow: hidden;

                ::ng-deep .p-datatable {
                    .p-datatable-thead > tr > th {
                        background: #f8f9fa;
                        color: #666;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 0.8rem;
                        letter-spacing: 0.5px;
                        border: none;
                        padding: 1rem;
                    }

                    .p-datatable-tbody > tr {
                        transition: all 0.2s ease;

                        &:hover {
                            background: #f8f9fa;
                        }

                        td {
                            padding: 1rem;
                            border: none;
                            border-bottom: 1px solid #f0f0f0;
                        }
                    }

                    .ranking-row {
                        .position-badge {
                            .position-number {
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                width: 36px;
                                height: 36px;
                                background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
                                color: white;
                                border-radius: 50%;
                                font-weight: 700;
                                font-size: 1rem;
                            }
                        }

                        .player-cell {
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;

                            .player-avatar-mini {
                                width: 36px;
                                height: 36px;
                                background: linear-gradient(135deg, #8B4513, #654321);
                                color: white;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: 700;
                                font-size: 0.85rem;
                                flex-shrink: 0;
                            }

                            .player-name {
                                font-weight: 600;
                                color: #333;
                            }
                        }

                        .score-cell {
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                            font-size: 1.2rem;
                            font-weight: 700;
                            color: #27ae60;

                            i {
                                color: #f39c12;
                                font-size: 1rem;
                            }
                        }

                        .categoria-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.4rem;
                            background: #f0f0f0;
                            padding: 0.4rem 0.9rem;
                            border-radius: 16px;
                            font-size: 0.85rem;
                            font-weight: 600;
                            color: #666;
                        }

                        .tiempo-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.4rem;
                            color: #666;
                            font-weight: 600;
                            font-size: 0.9rem;

                            i {
                                color: #8B4513;
                            }
                        }

                        .fecha-text {
                            color: #999;
                            font-size: 0.85rem;
                        }
                    }
                }
            }
        }

        // ==================== ESTADO VACÍO ====================
        .empty-state-global {
            background: white;
            border-radius: 20px;
            padding: 5rem 2rem;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

            .empty-animation {
                font-size: 6rem;
                animation: bounce 2s infinite;
                filter: grayscale(1);
                opacity: 0.3;
            }

            h3 {
                font-size: 1.8rem;
                font-weight: 700;
                color: #333;
                margin: 1.5rem 0 0.5rem;
            }

            p {
                font-size: 1.1rem;
                color: #666;
                margin: 0;
            }
        }

        // ==================== ANIMACIONES ====================
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }

        @keyframes float {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, -10px); }
        }

        // ==================== RESPONSIVE ====================
        @media (max-width: 1200px) {
            .podio-section .podio-container {
                flex-wrap: wrap;

                .podio-card {
                    flex: 0 0 calc(50% - 0.75rem);
                }

                .podio-card.primero {
                    flex: 0 0 100%;
                    order: -1;
                }
            }
        }

        @media (max-width: 768px) {
            .ranking-wrapper {
                padding: 1rem;
            }

            .ranking-header {
                padding: 2rem 1.5rem;

                .header-content .title {
                    font-size: 2rem;
                }

                .stats-quick {
                    gap: 2rem;
                }
            }

            .filtros-section .filtros-container {
                grid-template-columns: 1fr;
            }

            .podio-section .podio-container {
                flex-direction: column;

                .podio-card {
                    flex: 0 0 100%;
                }
            }

            .tabla-section .tabla-header {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
        }
    `]
})
export class RankingComponent implements OnInit {
    ranking: RankingResponse[] = [];
    nivelFiltro?: NivelDificultad;
    categoriaFiltro?: CategoriasCultural;

    nivelesOpciones = [
        { label: 'Fácil', value: NivelDificultad.FACIL },
        { label: 'Medio', value: NivelDificultad.MEDIO },
        { label: 'Difícil', value: NivelDificultad.DIFICIL }
    ];

    categoriasOpciones = [
        { label: 'Vestimenta', value: CategoriasCultural.VESTIMENTA },
        { label: 'Música', value: CategoriasCultural.MUSICA },
        { label: 'Lugares', value: CategoriasCultural.LUGARES },
        { label: 'Festividades', value: CategoriasCultural.FESTIVIDADES }
    ];

    constructor(private partidaService: PartidaService) {}

    ngOnInit() {
        this.cargarRanking();
    }

    cargarRanking() {
        if (this.nivelFiltro && this.categoriaFiltro) {
            this.partidaService.obtenerRankingPorNivelYCategoria(this.nivelFiltro, this.categoriaFiltro).subscribe({
                next: (data) => {
                    console.log('🔍 RANKING RECIBIDO:', data);
                    console.log('📊 Total de jugadores:', data.length);
                    console.log('📋 Datos completos:', JSON.stringify(data, null, 2));
                    this.ranking = data;
                },
                error: (error) => console.error('Error:', error)
            });
        } else {
            this.partidaService.obtenerRankingGlobal().subscribe({
                next: (data) => {
                    console.log('🔍 RANKING GLOBAL RECIBIDO:', data);
                    console.log('📊 Total de jugadores:', data.length);
                    console.log('📋 Datos completos:', JSON.stringify(data, null, 2));
                    this.ranking = data;
                },
                error: (error) => console.error('Error:', error)
            });
        }
    }

    obtenerRankingTabla(): RankingResponse[] {
        const tabla = this.ranking.length > 3 ? this.ranking.slice(3) : [];
        console.log('📋 TABLA A MOSTRAR:', tabla);
        console.log('   - Total ranking:', this.ranking.length);
        console.log('   - En tabla:', tabla.length);
        return tabla;
    }

    // ⬇️ NUEVO MÉTODO

    obtenerMejorPuntuacion(): number {
        return this.ranking.length > 0 ? this.ranking[0].puntuacion : 0;
    }

    obtenerIniciales(nombre: string): string {
        const palabras = nombre.split(' ');
        if (palabras.length >= 2) {
            return (palabras[0][0] + palabras[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    }

    obtenerEmojiCategoria(categoria: CategoriasCultural): string {
        const emojis: Record<CategoriasCultural, string> = {
            [CategoriasCultural.VESTIMENTA]: '👗',
            [CategoriasCultural.MUSICA]: '🎵',
            [CategoriasCultural.LUGARES]: '🗺️',
            [CategoriasCultural.FESTIVIDADES]: '🎉'
        };
        return emojis[categoria] || '✨';
    }

    formatearTiempo(segundos: number): string {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}:${segs.toString().padStart(2, '0')}`;
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    getNivelLabel(nivel: NivelDificultad): string {
        const labels = {
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
}
