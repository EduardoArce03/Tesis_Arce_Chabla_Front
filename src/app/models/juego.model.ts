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
