class Insignia {}

class EstadisticasUsuario {}

class PreferenciasUsuario {}

export interface Usuario {
    id: number;
    nombre: string;
    codigoJugador: string;
    fechaCreacion: string;
}

export interface CrearUsuarioRequest {
    nombre: string;
    edadAproximada?: number;
    nivelEducativo?: string;
}

export interface LoginConCodigoRequest {
    codigoJugador: string;
}

export interface UsuarioResponse {
    id: number;
    nombre: string;
    codigoJugador: string;
    fechaCreacion: string;
    mensaje: string;
}

export enum JerarquiaCanari {
    YACHAK_INICIANTE = 'Yachak Iniciante', // Aprendiz
    RUNA_YACHACHIK = 'Runa Yachachik', // Enseñante del Pueblo
    AMAWTA = 'Amawta', // Sabio
    KURAKA = 'Kuraka', // Líder/Autoridad
    APU = 'Apu' // Gran Señor/Máxima autoridad
}
