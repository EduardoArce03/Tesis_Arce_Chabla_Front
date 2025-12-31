import { NivelDificultad, CategoriasCultural } from './juego.model';

export interface EstadisticasDetalladasResponse {
    resumenGeneral: ResumenEstadisticas;
    historialPartidas: PartidaHistorial[];
    estadisticasPorNivel: EstadisticasPorNivel[];
    estadisticasPorCategoria: EstadisticasPorCategoria[];
    graficoPuntuaciones: PuntoGrafico[];
    mejoresPartidas: PartidaHistorial[];
    rachas: RachasEstadisticas;
}

export interface ResumenEstadisticas {
    totalPartidas: number;
    partidasCompletadas: number;
    tasaCompletacion: number;
    puntuacionTotal: number;
    puntuacionPromedio: number;
    mejorPuntuacion: number | null;
    tiempoTotalMinutos: number;
    tiempoPromedioMinutos: number;
    precisionPromedio: number;
    nivelFavorito: NivelDificultad | null;
    categoriaFavorita: CategoriasCultural | null;
}

export interface PartidaHistorial {
    id: number;
    fechaInicio: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    puntuacion: number;
    intentos: number;
    tiempoSegundos: number;
    completada: boolean;
    precision: number;
}

export interface EstadisticasPorNivel {
    nivel: NivelDificultad;
    partidasJugadas: number;
    partidasCompletadas: number;
    puntuacionPromedio: number;
    mejorPuntuacion: number | null;
    precisionPromedio: number;
}

export interface EstadisticasPorCategoria {
    categoria: CategoriasCultural;
    partidasJugadas: number;
    puntuacionPromedio: number;
    mejorPuntuacion: number | null;
}

export interface PuntoGrafico {
    fecha: string;
    puntuacion: number;
    nivel: NivelDificultad;
}

export interface RachasEstadisticas {
    rachaActual: number;
    mejorRacha: number;
    partidasConsecutivasSinPerder: number;
    ultimaPartidaGanada: string | null;
}
