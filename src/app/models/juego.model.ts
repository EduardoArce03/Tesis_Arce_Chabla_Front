class Requisito {}

class Dificultad {}

export interface Juego {
    id: number;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    tipo: TipoJuego;
    dificultad: Dificultad;
    categoriasCulturales: CategoriasCultural[];
    puntosRecompensa: number;
    experienciaRecompensa: number;
    tiempoEstimado: number; // en minutos
    bloqueado: boolean;
    requisitos: Requisito[];
}

export enum TipoJuego {
    MEMORIA = 'MEMORIA',
    QUIZ = 'QUIZ',
    PUZZLE = 'PUZZLE',
    RITMO = 'RITMO',
    EXPLORACION = 'EXPLORACION',
    NARRATIVA = 'NARRATIVA'
}

export enum CategoriasCultural {
    VESTIMENTA = 'VESTIMENTA',
    MUSICA = 'MUSICA',
    //LENGUAJE = 'LENGUAJE',
    FESTIVIDADES = 'FESTIVIDADES',
    LUGARES = 'LUGARES',
    //LEYENDAS = 'LEYENDAS',
    //GASTRONOMIA = 'GASTRONOMIA',
    //ARTESANIA = 'ARTESANIA'
}


export enum NivelDificultad {
    FACIL = 'FACIL',
    MEDIO = 'MEDIO',
    DIFICIL = 'DIFICIL'
}

// Elemento Cultural
export interface ElementoCultural {
    id: number;
    nombreKichwa: string;
    nombreEspanol: string;
    imagenUrl: string;
    categoria: CategoriasCultural;
    descripcion?: string;
}

export interface CrearElementoCulturalRequest {
    nombreKichwa: string;
    nombreEspanol: string;
    imagenUrl: string;
    categoria: CategoriasCultural;
    descripcion?: string;
}

// Partida
export interface IniciarPartidaRequest {
    jugadorId: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
}

export interface IniciarPartidaResponse {
    partidaId: number;
    elementos: ElementoCultural[];
}

export interface FinalizarPartidaRequest {
    partidaId: number;
    intentos: number;
    tiempoSegundos: number;
}

export interface PartidaResponse {
    id: number;
    jugadorId: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    intentos: number;
    tiempoSegundos: number;
    puntuacion: number;
    completada: boolean;
    fechaInicio: string;
    fechaFin?: string;
}

export interface EstadisticasJugadorResponse {
    jugadorId: string;
    totalPartidas: number;
    partidasCompletadas: number;
    puntuacionPromedio: number;
    mejorPuntuacion?: number;
    tiempoPromedioSegundos: number;
    intentosPromedio: number;
}

export interface RankingResponse {
    posicion: number;
    jugadorId: string;
    puntuacion: number;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    tiempoSegundos: number;
    fecha: string;
}

// Tarjeta para el juego (frontend only)
export interface TarjetaMemoria {
    id: number;
    elementoId: number;
    imagen: string;
    nombreKichwa: string;
    nombreEspanol: string;
    categoria: CategoriasCultural;
    volteada: boolean;
    emparejada: boolean;
}
