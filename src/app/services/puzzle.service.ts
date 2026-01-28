// src/app/services/puzzle.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ImagenPuzzle,
    IniciarPuzzleRequest,
    IniciarPuzzleResponse,
    FinalizarPuzzleRequest,
    FinalizarPuzzleResponse,
    ProgresoJugador
} from '@/models/puzzle.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PuzzleService {
    private baseUrl = environment.apiUrl + '/puzzle';

    constructor(private http: HttpClient) {}

    /**
     * Obtiene todas las imágenes disponibles
     */
    obtenerImagenesDisponibles(jugadorId: string): Observable<ImagenPuzzle[]> {
        return this.http.get<ImagenPuzzle[]>(`${this.baseUrl}/imagenes/${jugadorId}`);
    }

    /**
     * Obtiene el progreso del jugador
     */
    obtenerProgreso(jugadorId: string): Observable<ProgresoJugador> {
        return this.http.get<ProgresoJugador>(`${this.baseUrl}/progreso/${jugadorId}`);
    }

    /**
     * Inicia una nueva partida
     */
    iniciarPuzzle(request: IniciarPuzzleRequest): Observable<IniciarPuzzleResponse> {
        return this.http.post<IniciarPuzzleResponse>(`${this.baseUrl}/iniciar`, request);
    }

    /**
     * Finaliza una partida
     */
    finalizarPuzzle(request: FinalizarPuzzleRequest): Observable<FinalizarPuzzleResponse> {
        return this.http.post<FinalizarPuzzleResponse>(`${this.baseUrl}/finalizar`, request);
    }
}
