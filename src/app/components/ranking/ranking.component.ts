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
    selector: 'app-components',
    template: `
    <div class="ranking-container">
      <h2>🏆 Tabla de Clasificación</h2>

      <!-- Filtros -->
      <p-card styleClass="filtros-card">
        <div class="filtros-grid">
          <div class="field">
            <label>Nivel</label>
            <p-select
              [options]="nivelesOpciones"
              [(ngModel)]="nivelFiltro"
              (onChange)="cargarRanking()"
              placeholder="Todos los niveles"
              [showClear]="true"
              [style]="{'width':'100%'}">
            </p-select>
          </div>

          <div class="field">
            <label>Categoría</label>
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
      </p-card>

      <!-- Tabla de Ranking -->
      <p-card header="Top 10 Mejores Puntuaciones">
        <p-table [value]="ranking">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 60px">Pos.</th>
              <th>Jugador</th>
              <th>Puntuación</th>
              <th>Nivel</th>
              <th>Categoría</th>
              <th>Tiempo</th>
              <th>Fecha</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr [class.destacado]="item.posicion <= 3">
              <td>
                <div class="posicion-badge" [class]="'pos-' + item.posicion">
                  <i *ngIf="item.posicion === 1" class="pi pi-trophy"></i>
                  <i *ngIf="item.posicion === 2" class="pi pi-star-fill"></i>
                  <i *ngIf="item.posicion === 3" class="pi pi-star"></i>
                  <span *ngIf="item.posicion > 3">{{ item.posicion }}</span>
                </div>
              </td>
              <td><strong>{{ item.jugadorId }}</strong></td>
              <td>
                <span class="puntuacion">{{ item.puntuacion }}</span>
              </td>
              <td>
                <p-tag [value]="getNivelLabel(item.nivel)" [severity]="getNivelSeverity(item.nivel)"></p-tag>
              </td>
              <td>{{ item.categoria }}</td>
              <td>{{ formatearTiempo(item.tiempoSegundos) }}</td>
              <td>{{ formatearFecha(item.fecha) }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" style="text-align: center; padding: 2rem;">
                No hay registros en el ranking
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
    styles: [`
    .ranking-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;

      h2 {
        margin-bottom: 2rem;
        color: #2c3e50;
      }

      .filtros-card {
        margin-bottom: 2rem;

        .filtros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;

          .field {
            label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #2c3e50;
            }
          }
        }
      }

      ::ng-deep .p-datatable {
        .destacado {
          background-color: #fff9e6 !important;
        }

        .posicion-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1.2rem;

          &.pos-1 {
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            color: white;
            i { font-size: 1.5rem; }
          }

          &.pos-2 {
            background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
            color: white;
            i { font-size: 1.3rem; }
          }

          &.pos-3 {
            background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
            color: white;
            i { font-size: 1.3rem; }
          }
        }

        .puntuacion {
          font-size: 1.2rem;
          font-weight: 700;
          color: #27ae60;
        }
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
                next: (data) => this.ranking = data,
                error: (error) => console.error('Error al cargar components:', error)
            });
        } else {
            this.partidaService.obtenerRankingGlobal().subscribe({
                next: (data) => this.ranking = data,
                error: (error) => console.error('Error al cargar components:', error)
            });
        }
    }

    formatearTiempo(segundos: number): string {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}:${segs.toString().padStart(2, '0')}`;
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
            [NivelDificultad.MEDIO]: 'warn',      // 👈 'warn' en vez de 'warning'
            [NivelDificultad.DIFICIL]: 'danger'
        };
        return severities[nivel];
    }
}
