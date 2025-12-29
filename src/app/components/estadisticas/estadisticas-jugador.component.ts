import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { EstadisticasJugadorResponse, PartidaResponse, NivelDificultad } from '@/models/juego.model';
import { PartidaService } from '@/components/partida.service';

@Component({
  standalone: true,
  imports: [CommonModule, Card, Tag, TableModule],
  selector: 'app-estadisticas-jugador',
  template: `
    <div class="estadisticas-container">
      <h2>📊 Mis Estadísticas</h2>

      <!-- Resumen de Estadísticas -->
      <div class="stats-grid" *ngIf="estadisticas">
        <p-card>
          <div class="stat-card">
            <i class="pi pi-play-circle"></i>
            <span class="stat-value">{{ estadisticas.totalPartidas }}</span>
            <span class="stat-label">Partidas Jugadas</span>
          </div>
        </p-card>

        <p-card>
          <div class="stat-card">
            <i class="pi pi-check-circle"></i>
            <span class="stat-value">{{ estadisticas.partidasCompletadas }}</span>
            <span class="stat-label">Completadas</span>
          </div>
        </p-card>

        <p-card>
          <div class="stat-card">
            <i class="pi pi-star-fill"></i>
            <span class="stat-value">{{ estadisticas.puntuacionPromedio.toFixed(0) }}</span>
            <span class="stat-label">Puntuación Promedio</span>
          </div>
        </p-card>

        <p-card>
          <div class="stat-card">
            <i class="pi pi-trophy"></i>
            <span class="stat-value">{{ estadisticas.mejorPuntuacion || 0 }}</span>
            <span class="stat-label">Mejor Puntuación</span>
          </div>
        </p-card>

        <p-card>
          <div class="stat-card">
            <i class="pi pi-clock"></i>
            <span class="stat-value">{{ formatearTiempo(estadisticas.tiempoPromedioSegundos) }}</span>
            <span class="stat-label">Tiempo Promedio</span>
          </div>
        </p-card>

        <p-card>
          <div class="stat-card">
            <i class="pi pi-sync"></i>
            <span class="stat-value">{{ estadisticas.intentosPromedio.toFixed(1) }}</span>
            <span class="stat-label">Intentos Promedio</span>
          </div>
        </p-card>
      </div>

      <!-- Historial de Partidas -->
      <p-card header="Historial de Partidas" styleClass="historial-card">
        <p-table [value]="historial" [paginator]="true" [rows]="10">
          <ng-template pTemplate="header">
            <tr>
              <th>Fecha</th>
              <th>Nivel</th>
              <th>Categoría</th>
              <th>Intentos</th>
              <th>Tiempo</th>
              <th>Puntuación</th>
              <th>Estado</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-partida>
            <tr>
              <td>{{ formatearFecha(partida.fechaInicio) }}</td>
              <td>
                <p-tag [value]="getNivelLabel(partida.nivel)" [severity]="getNivelSeverity(partida.nivel)"></p-tag>
              </td>
              <td>{{ partida.categoria }}</td>
              <td>{{ partida.intentos }}</td>
              <td>{{ formatearTiempo(partida.tiempoSegundos) }}</td>
              <td><strong>{{ partida.puntuacion }}</strong></td>
              <td>
                <p-tag
                  [value]="partida.completada ? 'Completada' : 'Incompleta'"
                  [severity]="partida.completada ? 'success' : 'warn'">
                </p-tag>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .estadisticas-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;

      h2 {
        margin-bottom: 2rem;
        color: #2c3e50;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          text-align: center;

          i {
            font-size: 3rem;
            color: #3498db;
            margin-bottom: 1rem;
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            font-size: 0.9rem;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
        }
      }

      .historial-card {
        margin-top: 2rem;
      }
    }
  `]
})
export class EstadisticasJugadorComponent implements OnInit {
  estadisticas?: EstadisticasJugadorResponse;
  historial: PartidaResponse[] = [];
  jugadorId: string = '';

  constructor(private partidaService: PartidaService) {}

  ngOnInit() {
    this.jugadorId = localStorage.getItem('jugadorId') || '';
    if (this.jugadorId) {
      this.cargarEstadisticas();
      this.cargarHistorial();
    }
  }

  cargarEstadisticas() {
    this.partidaService.obtenerEstadisticas(this.jugadorId).subscribe({
      next: (data) => this.estadisticas = data,
      error: (error) => console.error('Error al cargar estadísticas:', error)
    });
  }

  cargarHistorial() {
    this.partidaService.obtenerHistorial(this.jugadorId).subscribe({
      next: (data) => this.historial = data,
      error: (error) => console.error('Error al cargar historial:', error)
    });
  }

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
