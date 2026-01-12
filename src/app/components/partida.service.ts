import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IniciarPartidaRequest,
  IniciarPartidaResponse,
  FinalizarPartidaRequest,
  PartidaResponse,
  EstadisticasJugadorResponse,
  RankingResponse,
  NivelDificultad,
  CategoriasCultural, ProcesarErrorResponse, ProcesarErrorRequest, ProcesarParejaRequest, ProcesarParejaResponse,
    SolicitarHintRequest, SolicitarHintResponse, ResponderPreguntaRequest, ResponderPreguntaResponse,
    FinalizarPartidaResponse
} from '@/models/juego.model';
import { environment } from '@/env/environment';

@Injectable({
  providedIn: 'root'
})
export class PartidaService {
  private apiUrl = `${environment.apiUrl}/partidas`;

  constructor(private http: HttpClient) {}

  /**
   * Inicia una nueva partida
   */
  iniciarPartida(request: IniciarPartidaRequest): Observable<IniciarPartidaResponse> {
    return this.http.post<IniciarPartidaResponse>(`${this.apiUrl}/iniciar`, request);
  }

  /**
   * Finaliza una partida y calcula la puntuación
   */
      finalizarPartida(request: FinalizarPartidaRequest): Observable<FinalizarPartidaResponse> {
    return this.http.post<FinalizarPartidaResponse>(`${this.apiUrl}/finalizar`, request);
  }

  /**
   * Obtiene el historial de partidas de un jugador
   */
  obtenerHistorial(jugadorId: string): Observable<PartidaResponse[]> {
    return this.http.get<PartidaResponse[]>(`${this.apiUrl}/historial/${jugadorId}`);
  }

  /**
   * Obtiene las estadísticas de un jugador
   */
  obtenerEstadisticas(jugadorId: string): Observable<EstadisticasJugadorResponse> {
    return this.http.get<EstadisticasJugadorResponse>(`${this.apiUrl}/estadisticas/${jugadorId}`);
  }

  /**
   * Obtiene el components global
   */
  obtenerRankingGlobal(limite: number = 10): Observable<RankingResponse[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<RankingResponse[]>(`${this.apiUrl}/ranking`, { params });
  }

  /**
   * Obtiene el components por nivel y categoría
   */
  obtenerRankingPorNivelYCategoria(
    nivel: NivelDificultad,
    categoria: CategoriasCultural,
    limite: number = 10
  ): Observable<RankingResponse[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<RankingResponse[]>(
      `${this.apiUrl}/ranking/${nivel}/${categoria}`,
      { params }
    );
  }

    // ==================== NUEVOS ENDPOINTS DE GAMIFICACIÓN ====================

    /**
     * Procesa un error (pareja incorrecta) y obtiene narrativa educativa
     */
    procesarError(partidaId: number, request: ProcesarErrorRequest): Observable<ProcesarErrorResponse> {
        return this.http.post<ProcesarErrorResponse>(`${this.apiUrl}/${partidaId}/error`, request);
    }

    /**
     * Procesa una pareja correcta y obtiene diálogo cultural si aplica
     */
    procesarParejaCorrecta(partidaId: number, request: ProcesarParejaRequest): Observable<ProcesarParejaResponse> {
        return this.http.post<ProcesarParejaResponse>(`${this.apiUrl}/${partidaId}/pareja-correcta`, request);
    }

    /**
     * Solicita un hint (cuesta puntos)
     */
    solicitarHint(partidaId: number, request: SolicitarHintRequest): Observable<SolicitarHintResponse> {
        return this.http.post<SolicitarHintResponse>(`${this.apiUrl}/${partidaId}/solicitar-hint`, request);
    }

    /**
     * Responde pregunta de recuperación de vida
     */
    responderPregunta(partidaId: number, request: ResponderPreguntaRequest): Observable<ResponderPreguntaResponse> {
        return this.http.post<ResponderPreguntaResponse>(`${this.apiUrl}/${partidaId}/responder-pregunta`, request);
    }
}
