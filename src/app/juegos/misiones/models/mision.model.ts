// models/mision.model.ts

import { FaseMision } from '@/juegos/misiones/models/fase-mision.model';
import { CategoriasCultural } from '@/models/juego.model';

export enum TipoMision {
    INVESTIGACION = 'INVESTIGACION',
    BUSQUEDA_MULTI_PUNTO = 'BUSQUEDA_MULTI_PUNTO',
    MISTERIO = 'MISTERIO',
    COMPARACION = 'COMPARACION',
    TEMPORAL = 'TEMPORAL'
}

export enum DificultadMision {
    FACIL = 'FACIL',
    MEDIO = 'MEDIO',
    DIFICIL = 'DIFICIL',
    EXPERTO = 'EXPERTO'
}

export enum EstadoMision {
    BLOQUEADA = 'BLOQUEADA',
    DISPONIBLE = 'DISPONIBLE',
    EN_PROGRESO = 'EN_PROGRESO',
    COMPLETADA = 'COMPLETADA',
    FALLIDA = 'FALLIDA'
}

export interface NPCGuia {
    nombre: string;
    nombreKichwa: string;
    avatar: string;
    descripcion: string;
    personalidad: string;
}

export interface Requisitos {
    nivelMinimo?: number;
    puntosVisitados?: number[];
    misionesPrevias?: string[];
    insignias?: string[];
}

export interface Recompensas {
    experiencia: number;
    puntos: number;
    insignias: Insignia[];
    desbloqueos: {
        misiones?: string[];
        puntosInteres?: number[];
        contenidoEspecial?: string[];
    };
    narrativaEspecial: boolean;
}

export interface Insignia {
    id: string;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    icono: string;
    rareza: 'comun' | 'raro' | 'epico' | 'legendario';
}

export interface Mision {
    id: string;
    titulo: string;
    tituloKichwa: string;
    descripcion: string;
    descripcionCorta: string;

    tipo: TipoMision;
    categoria: CategoriasCultural;
    dificultad: DificultadMision;

    npcGuia: NPCGuia;
    imagenPortada: string;

    requisitos: Requisitos;
    recompensas: Recompensas;

    fases: FaseMision[];

    tiempoEstimado: number; // minutos
    intentosMaximos?: number;

    estado: EstadoMision;
    progreso?: ProgresoMision;
}

export interface ProgresoMision {
    usuarioId: number;
    misionId: string;
    faseActual: number;
    intentos: number;
    respuestasCorrectas: number;
    respuestasIncorrectas: number;
    pistasUsadas: number;
    fechaInicio: Date;
    tiempoTranscurrido: number; // segundos
    puntuacion: number;
}
