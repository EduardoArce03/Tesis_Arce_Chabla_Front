class Insignia {}

class EstadisticasUsuario {}

class PreferenciasUsuario {}

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    avatar: string;
    jerarquiaActual: JerarquiaCanari;
    puntosAcumulados: number;
    nivel: number;
    experiencia: number;
    insignias: Insignia[];
    estadisticas: EstadisticasUsuario;
    preferencias: PreferenciasUsuario;
}

export enum JerarquiaCanari {
    YACHAK_INICIANTE = 'Yachak Iniciante', // Aprendiz
    RUNA_YACHACHIK = 'Runa Yachachik', // Enseñante del Pueblo
    AMAWTA = 'Amawta', // Sabio
    KURAKA = 'Kuraka', // Líder/Autoridad
    APU = 'Apu' // Gran Señor/Máxima autoridad
}
