// src/app/models/puzzle.model.ts

export interface ImagenPuzzle {
    id: number;
    titulo: string;
    nombreKichwa: string;
    categoria: string;
    imagenUrl: string;
    desbloqueada: boolean;
    ordenDesbloqueo: number;
    dificultadMinima: number;
    dificultadMaxima: number;
}

export interface IniciarPuzzleRequest {
    jugadorId: string;
    imagenId: number;
    gridSize: number;
}

export interface IniciarPuzzleResponse {
    partidaId: number;
    imagen: ImagenPuzzle;
    mensajeBienvenida: string;
}

export interface FinalizarPuzzleRequest {
    partidaId: number;
    movimientos: number;
    tiempoSegundos: number;
    hintsUsados: number;
}

export interface FinalizarPuzzleResponse {
    estrellas: number;
    tiempoTotal: number;
    movimientosTotal: number;
    hintsUsados: number;
    mensaje: string;
    siguienteImagenDesbloqueada: ImagenPuzzle | null;
    progresoActual: ProgresoJugador;
}

export interface ProgresoJugador {
    jugadorId: string;
    estrellasTotal: number;
    puzzlesCompletados: number;
    mejorTiempo: number;
    imagenesDesbloqueadas: number;
}
