// src/app/models/puzzle.model.ts

export interface IniciarPuzzleRequest {
    jugadorId: string;
    imagenId: number;
    gridSize: number;
}

export interface IniciarPuzzleResponse {
    partidaId: number;
    mensajeBienvenida: string;
    tiempoLimiteSegundos: number; // ⬅️ NUEVO
    gridSize: number;
}

export interface FinalizarPuzzleRequest {
    partidaId: number;
    jugadorId: string;
    movimientos: number;
    tiempoRestante: number; // ⬅️ CAMBIADO de tiempoSegundos
    hintsUsados: number;
}

export interface FinalizarPuzzleResponse {
    estrellas: number;
    mensaje: string;
    puntosObtenidos: number;
    tiempoFinal: number; // ⬅️ NUEVO
    siguienteImagenDesbloqueada: ImagenPuzzle | null;
    progresoActual: ProgresoJugador;
}

export interface ProgresoJugador {
    jugadorId: string;
    estrellasTotal: number;
    puntosTotal: number; // ⬅️ NUEVO
    puzzlesCompletados: number;
    mejorTiempo: number;
    imagenesDesbloqueadas: number;
}

export interface ImagenPuzzle {
    id: number;
    titulo: string;
    nombreKichwa: string;
    imagenUrl: string;
    categoria: string;
    dificultadMinima: number;
    dificultadMaxima: number;
    ordenDesbloqueo: number;
    desbloqueada: boolean;
}
