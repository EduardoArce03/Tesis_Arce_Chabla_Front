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
    CategoriasCultural,
    ProcesarErrorResponse,
    ProcesarErrorRequest,
    ProcesarParejaRequest,
    ProcesarParejaResponse,
    SolicitarHintRequest,
    SolicitarHintResponse,
    ResponderPreguntaRequest,
    ResponderPreguntaResponse,
    FinalizarPartidaResponse
} from '@/models/juego.model';
import { environment } from '@/env/environment';

@Injectable({
    providedIn: 'root'
})
export class PartidaService {
    private apiUrl = `${environment.apiUrl}/partidas`;

    constructor(private http: HttpClient) {}

    iniciarPartida(request: IniciarPartidaRequest): Observable<IniciarPartidaResponse> {
        return this.http.post<IniciarPartidaResponse>(`${this.apiUrl}/iniciar`, request);
        //                                            ↑ PARÉNTESIS AGREGADO
    }

    finalizarPartida(request: FinalizarPartidaRequest): Observable<FinalizarPartidaResponse> {
        return this.http.post<FinalizarPartidaResponse>(`${this.apiUrl}/finalizar`, request);
        //                                              ↑
    }

    obtenerHistorial(jugadorId: string): Observable<PartidaResponse[]> {
        return this.http.get<PartidaResponse[]>(`${this.apiUrl}/historial/${jugadorId}`);
        //                                      ↑
    }

    obtenerEstadisticas(jugadorId: string): Observable<EstadisticasJugadorResponse> {
        return this.http.get<EstadisticasJugadorResponse>(`${this.apiUrl}/estadisticas/${jugadorId}`);
        //                                                ↑
    }

    obtenerRankingGlobal(limite: number = 10): Observable<RankingResponse[]> {
        const params = new HttpParams().set('limite', limite.toString());
        return this.http.get<RankingResponse[]>(`${this.apiUrl}/ranking`, { params });
        //                                      ↑
    }

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

    // ==================== GAMIFICACIÓN ====================

    procesarError(partidaId: number, request: ProcesarErrorRequest): Observable<ProcesarErrorResponse> {
        return this.http.post<ProcesarErrorResponse>(`${this.apiUrl}/${partidaId}/error`, request);
        //                                           ↑
    }

    procesarParejaCorrecta(partidaId: number, request: ProcesarParejaRequest): Observable<ProcesarParejaResponse> {
        return this.http.post<ProcesarParejaResponse>(`${this.apiUrl}/${partidaId}/pareja-correcta`, request);
        //                                            ↑
    }

    solicitarHint(partidaId: number, request: SolicitarHintRequest): Observable<SolicitarHintResponse> {
        return this.http.post<SolicitarHintResponse>(`${this.apiUrl}/${partidaId}/solicitar-hint`, request);
        //                                           ↑
    }

    responderPregunta(partidaId: number, request: ResponderPreguntaRequest): Observable<ResponderPreguntaResponse> {
        return this.http.post<ResponderPreguntaResponse>(`${this.apiUrl}/${partidaId}/responder-pregunta`, request);
        //                                                ↑
    }
}
