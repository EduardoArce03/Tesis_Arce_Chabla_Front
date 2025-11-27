// models/fase-mision.model.ts

export enum TipoFase {
    INTRODUCCION = 'INTRODUCCION',
    ANALISIS_IMAGEN = 'ANALISIS_IMAGEN',
    PREGUNTA_MULTIPLE = 'PREGUNTA_MULTIPLE',
    PREGUNTA_ABIERTA = 'PREGUNTA_ABIERTA',
    BUSQUEDA_PUNTO = 'BUSQUEDA_PUNTO',
    PUZZLE = 'PUZZLE',
    ORDENAMIENTO = 'ORDENAMIENTO',
    SELECCION_MULTIPLE = 'SELECCION_MULTIPLE',
    CONCLUSION = 'CONCLUSION'
}

export interface FaseMision {
    id: number;
    tipo: TipoFase;
    titulo?: string;

    // Contenido
    textoNarrativa?: string;
    imagenUrl?: string;
    puntoInteresId?: number;

    // Para análisis BLIP-2 (mock)
    usaBlip2: boolean;
    analisisBlip2?: string; // Texto pre-generado para mock

    // Para preguntas
    pregunta?: Pregunta;

    // Para puzzles
    puzzle?: PuzzleConfig;

    // Para búsqueda
    puntosObjetivo?: number[];
    pistasProgreso?: string[];

    // Navegación
    obligatoria: boolean;
    tiempoLimite?: number;
}

export interface Pregunta {
    textoPregunta: string;
    tipo: 'multiple' | 'abierta' | 'seleccion';
    opciones?: OpcionRespuesta[];
    respuestaCorrecta?: string | string[];
    explicacion: string;
    pista?: string;
    elementosClave: string[];
}

export interface OpcionRespuesta {
    id: string;
    texto: string;
    correcta: boolean;
    explicacion?: string;
}

export interface PuzzleConfig {
    tipo: 'ordenar' | 'conectar' | 'seleccionar';
    elementos: ElementoPuzzle[];
    solucion: any;
    ayudaVisual?: string;
}

export interface ElementoPuzzle {
    id: string;
    contenido: string;
    imagen?: string;
    metadata?: any;
}
