export interface FaseMision {
    id?: number;
    numeroFase: number;
    titulo?: string;
    tipo: TipoFase;
    textoNarrativa?: string;
    imagenUrl?: string;

    // Para análisis BLIP-2
    usaBlip2?: boolean;
    analisisBlip2?: string;

    // Para preguntas
    pregunta?: PreguntaMision;

    // Para búsqueda de puntos
    puntosObjetivo?: number[];
    pistasProgreso?: string[];

    // Para ordenamiento
    puzzle?: PuzzleOrdenamiento;
}

export interface PreguntaMision {
    tipo: 'multiple' | 'abierta';
    textoPregunta: string;
    opciones?: OpcionRespuesta[];
    respuestaCorrecta?: string;
    explicacion: string;
    pista?: string;
    elementosClave?: string[];
}

export interface OpcionRespuesta {
    id: string;
    texto: string;
    correcta: boolean;
    explicacion?: string;
}

export interface PuzzleOrdenamiento {
    elementos: ElementoPuzzle[];
    solucion: string[];
    ayudaVisual?: string;
}

export interface ElementoPuzzle {
    id: string;
    contenido: string;
    imagen?: string;
}

export interface ProgresoMision {
    faseActual: number;
    respuestasCorrectas: number;
    respuestasIncorrectas: number;
    intentos: number;
    puntuacion: number;
    pistasUsadas: number;
    tiempoTranscurrido: number;
}

export enum TipoFase {
    INTRODUCCION = 'INTRODUCCION',
    ANALISIS_IMAGEN = 'ANALISIS_IMAGEN',
    PREGUNTA_MULTIPLE = 'PREGUNTA_MULTIPLE',
    PREGUNTA_ABIERTA = 'PREGUNTA_ABIERTA',
    BUSQUEDA_PUNTO = 'BUSQUEDA_PUNTO',
    ORDENAMIENTO = 'ORDENAMIENTO',
    CONCLUSION = 'CONCLUSION'
}
