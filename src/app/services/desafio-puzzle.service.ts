// src/app/services/desafio-puzzle.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface DesafioGenerado {
    desafioId: number;
    pregunta: string;
    opciones: string[];
    tiempoLimite: number;
}

export interface ResponderDesafio {
    desafioId: number;
    respuestaSeleccionada: string;
}

export interface ResponderDesafioResponse {
    correcto: boolean;
    mensaje: string;
    powerUpObtenido: PowerUpPuzzle | null;
    powerUpsDisponibles: PowerUpDisponible[];
    tiempoBonus: number; // ⬅️ NUEVO: Segundos de bonus por respuesta correcta
}

export interface PowerUpDisponible {
    id: number;
    tipo: PowerUpPuzzle;
    nombre: string;
    descripcion: string;
    icono: string;
}

export interface UsarPowerUpRequest {
    powerUpId: number;
    partidaId: number;
}

export interface UsarPowerUpResponse {
    tipo: PowerUpPuzzle;
    mensaje: string;
    datos: {
        duracion?: number;
        piezas?: number;
        multiplicador?: number;
    };
}

export enum PowerUpPuzzle {
    VISION_CONDOR = 'VISION_CONDOR',
    TIEMPO_PACHAMAMA = 'TIEMPO_PACHAMAMA',
    SABIDURIA_AMAWTA = 'SABIDURIA_AMAWTA',
    BENDICION_SOL = 'BENDICION_SOL'
}

@Injectable({
    providedIn: 'root'
})
export class DesafioPuzzleService {
    private readonly API_URL = `${environment.apiUrl}/puzzle/desafios`; // ⬅️ Agregado /api

    constructor(private http: HttpClient) {}

    generarDesafio(partidaId: number): Observable<DesafioGenerado> {
        return this.http.post<DesafioGenerado>(
            `${this.API_URL}/generar/${partidaId}`,
            {}
        );
    }

    responderDesafio(request: ResponderDesafio): Observable<ResponderDesafioResponse> {
        return this.http.post<ResponderDesafioResponse>(
            `${this.API_URL}/responder`,
            request
        );
    }

    usarPowerUp(request: UsarPowerUpRequest): Observable<UsarPowerUpResponse> {
        return this.http.post<UsarPowerUpResponse>(
            `${this.API_URL}/usar-powerup`,
            request
        );
    }

    obtenerPowerUps(partidaId: number): Observable<PowerUpDisponible[]> {
        return this.http.get<PowerUpDisponible[]>(
            `${this.API_URL}/powerups/${partidaId}`
        );
    }
}
