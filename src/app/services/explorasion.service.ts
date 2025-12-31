import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/env/environment';
import {
    ArtefactoDTO,
    BuscarArtefactoRequest, DashboardExploracionResponse, DetallePuntoResponse, EstadisticasExploracionDTO, MisionDTO,
    ResponderQuizRequest, ResultadoBusquedaResponse, ResultadoQuizResponse, VisitaPuntoResponse, VisitarPuntoRequest } from '@/models/explorasion.model';

@Injectable({
    providedIn: 'root'
})
export class ExploracionService {
    private apiUrl = `${environment.apiUrl}/exploracion`;

    constructor(private http: HttpClient) {}

    obtenerDashboard(usuarioId: number): Observable<DashboardExploracionResponse> {
        return this.http.get<DashboardExploracionResponse>(`${this.apiUrl}/dashboard/${usuarioId}`);
    }

    obtenerDetallePunto(puntoId: number, usuarioId: number): Observable<DetallePuntoResponse> {
        return this.http.get<DetallePuntoResponse>(
            `${this.apiUrl}/punto/${puntoId}/detalle?usuarioId=${usuarioId}`
        );
    }

    visitarPunto(request: VisitarPuntoRequest): Observable<VisitaPuntoResponse> {
        return this.http.post<VisitaPuntoResponse>(`${this.apiUrl}/visitar`, request);
    }

    responderQuiz(request: ResponderQuizRequest): Observable<ResultadoQuizResponse> {
        return this.http.post<ResultadoQuizResponse>(`${this.apiUrl}/quiz/responder`, request);
    }

    buscarArtefacto(request: BuscarArtefactoRequest): Observable<ResultadoBusquedaResponse> {
        return this.http.post<ResultadoBusquedaResponse>(`${this.apiUrl}/artefacto/buscar`, request);
    }

    obtenerColeccion(usuarioId: number): Observable<ArtefactoDTO[]> {
        return this.http.get<ArtefactoDTO[]>(`${this.apiUrl}/coleccion/${usuarioId}`);
    }

    obtenerMisiones(usuarioId: number): Observable<MisionDTO[]> {
        return this.http.get<MisionDTO[]>(`${this.apiUrl}/misiones/${usuarioId}`);
    }

    aceptarMision(usuarioId: number, misionId: number): Observable<MisionDTO> {
        return this.http.post<MisionDTO>(
            `${this.apiUrl}/mision/${misionId}/aceptar?usuarioId=${usuarioId}`,
            {}
        );
    }

    obtenerEstadisticas(usuarioId: number): Observable<EstadisticasExploracionDTO> {
        return this.http.get<EstadisticasExploracionDTO>(`${this.apiUrl}/estadisticas/${usuarioId}`);
    }
}
