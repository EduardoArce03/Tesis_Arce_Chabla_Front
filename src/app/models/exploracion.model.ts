export interface PuntoInteres {
    id: number;
    nombre: string;
    nombreKichwa: string;
    coordenadas: { x: number; y: number }; // Posición en el SVG (%)
    imagenUrl: string;
    categoria: CategoriaPunto;
    desbloqueado: boolean;
    visitado: boolean;
    nivelDescubrimiento: NivelDescubrimiento;
    descripcionCorta: string;
    requisitos?: number[]; // IDs de puntos que deben visitarse antes
}

export enum CategoriaPunto {
    TEMPLO = 'TEMPLO',
    PLAZA = 'PLAZA',
    VIVIENDA = 'VIVIENDA',
    DEPOSITO = 'DEPOSITO',
    OBSERVATORIO = 'OBSERVATORIO',
    CEREMONIAL = 'CEREMONIAL',
    CAMINO = 'CAMINO',
    FUENTE = 'FUENTE',
}

export enum NivelDescubrimiento {
    NO_VISITADO = 'NO_VISITADO',
    BRONCE = 'BRONCE',
    PLATA = 'PLATA',
    ORO = 'ORO'
}

export interface ProgresoExploracion {
    usuarioId: number;
    puntosVisitados: number[];
    totalPuntos: number;
    porcentajeCompletado: number;
    descubrimientos: Descubrimiento[];
    narrativasDesbloqueadas: number;
}

export interface Descubrimiento {
    id: number;
    puntoInteresId: number;
    objeto: string;
    descripcion: string;
    icono: string;
    fechaDescubrimiento: Date;
}

export interface NarrativaGenerada {
    puntoInteresId: number;
    texto: string;
    nivel: NivelDescubrimiento;
    elementosClave: string[];
    audioUrl?: string;
    timestamp: Date;
}
