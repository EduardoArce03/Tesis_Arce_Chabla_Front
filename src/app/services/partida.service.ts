import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '@/env/environment';
import { NivelDificultad, CategoriasCultural } from '@/models/juego.model';

// Modelo para guardar partida
export interface GuardarPartidaRequest {
    jugadorId: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    puntuacion: number;
    intentos: number;
    tiempoSegundos: number;
    completada: boolean;
}

export interface PartidaResponse {
    id: number;
    mensaje: string;
}

@Injectable({
    providedIn: 'root'
})
export class PartidaService {
    private apiUrl = `${environment.apiUrl}/partidas`;

    constructor(private http: HttpClient) {}

    /**
     * Guarda una partida completada
     */
    guardarPartida(datos: GuardarPartidaRequest): Observable<PartidaResponse> {
        console.log('💾 Guardando partida...');
        console.log('📋 Datos a enviar:', datos);
        console.log('📡 URL:', this.apiUrl);

        return this.http.post<PartidaResponse>(this.apiUrl, datos)
            .pipe(
                tap(response => {
                    console.log('✅ Partida guardada exitosamente:', response);
                    console.log('🎮 ID de la partida:', response.id);
                }),
                catchError(error => {
                    console.error('❌ Error al guardar partida:', error);
                    console.error('📍 Status:', error.status);
                    console.error('📍 Mensaje:', error.message);
                    console.error('📍 Datos enviados:', datos);
                    return throwError(() => error);
                })
            );
    }

    /**
     * Guarda una partida abandonada (incompleta)
     */
    guardarPartidaIncompleta(datos: Omit<GuardarPartidaRequest, 'completada'>): Observable<PartidaResponse> {
        return this.guardarPartida({
            ...datos,
            completada: false
        });
    }
}
