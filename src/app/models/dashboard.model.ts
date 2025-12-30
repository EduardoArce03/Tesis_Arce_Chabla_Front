export interface DashboardResponse {
    usuario: UsuarioInfo;
    estadisticas: EstadisticasResumen;
    rankingPosicion: RankingPosicion;
    logrosRecientes: Logro[];
    juegosDisponibles: JuegoDisponible[];
}

export interface UsuarioInfo {
    nombre: string;
    codigoJugador: string;
    nivel: number;
    experiencia: number;
    experienciaParaSiguienteNivel: number;
}

export interface EstadisticasResumen {
    totalPartidas: number;
    partidasCompletadas: number;
    puntuacionTotal: number;
    tiempoTotalMinutos: number;
    precisionPromedio: number;
    mejorPuntuacion: number | null;
}

export interface RankingPosicion {
    posicionGlobal: number;
    totalJugadores: number;
    top3: RankingItem[];
}

export interface RankingItem {
    posicion: number;
    nombre: string;
    codigoJugador: string;
    puntuacion: number;
}

export interface Logro {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    fechaObtenido: string;
    nuevo: boolean;
}

export interface JuegoDisponible {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    ruta: string;
    partidasJugadas: number;
    disponible: boolean;
}
