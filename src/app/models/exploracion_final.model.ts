// exploracion.model.ts - MODELS COMPLETOS CON TODAS LAS INTERFACES

// ========================================
// ENUMS
// ========================================

export enum CategoriaPunto {
    TEMPLO = 'TEMPLO',
    PLAZA = 'PLAZA',
    VIVIENDA = 'VIVIENDA',
    DEPOSITO = 'DEPOSITO',
    OBSERVATORIO = 'OBSERVATORIO',
    CEREMONIAL = 'CEREMONIAL',
    CAMINO = 'CAMINO'
}

export enum NivelDescubrimiento {
    NO_VISITADO = 'NO_VISITADO',
    BRONCE = 'BRONCE',
    PLATA = 'PLATA',
    ORO = 'ORO'
}

export enum NivelCapa {
    SUPERFICIE = 'SUPERFICIE',
    INCA = 'INCA',
    CANARI = 'CANARI',
    ANCESTRAL = 'ANCESTRAL'
}

export enum RarezaFoto {
    COMUN = 'COMUN',
    POCO_COMUN = 'POCO_COMUN',
    RARA = 'RARA',
    EPICA = 'EPICA',
    LEGENDARIA = 'LEGENDARIA'
}

// ========================================
// DTOs PRINCIPALES
// ========================================

/**
 * Punto de interés con su estado actual
 */
export interface PuntoInteresDTO {
    id: number;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    historiaDetallada: string;
    imagenUrl: string;

    // Ubicación
    coordenadaX: number;  // Para el mapa SVG
    coordenadaY: number;

    // Clasificación
    categoria: CategoriaPunto;
    nivelMinimo: number;
    ordenDesbloqueo: number;

    // Estado actual del usuario
    desbloqueado: boolean;
    visitado: boolean;
    nivelDescubrimiento: NivelDescubrimiento | null;
    visitas: number;

    // Progreso de capas
    capasCompletadas: number;
    capasTotales: number;

    // Artefactos
    artefactosDisponibles: number;
    artefactosEncontrados: number;
}

/**
 * Progreso general de exploración
 */
export interface ProgresoExploracionDTO {
    partidaId: number;
    usuarioId: number;

    // Nivel actual
    nivelActual: NivelCapa;
    nombreNivel: string;

    // Progreso puntos
    puntosDescubiertos: number;
    puntosTotales: number;
    porcentajeTotal: number;

    // Nivel de arqueólogo
    nivelArqueologo: number;
    nombreNivelArqueologo: string;
    experienciaTotal: number;
    experienciaSiguienteNivel: number;

    // Capas desbloqueadas
    capas: NivelCapaDTO[];
}

/**
 * Información de una capa temporal
 */
export interface NivelCapaDTO {
    nivel: NivelCapa;
    nombre: string;
    descripcion: string;
    desbloqueada: boolean;
    porcentajeDescubrimiento: number;
}

/**
 * Request para descubrir un punto
 */
export interface DescubrirPuntoRequest {
    partidaId: number;
    puntoId: number;
}

/**
 * Response al descubrir un punto
 */
export interface DescubrirPuntoResponse {
    puntoId: number;
    nombrePunto: string;
    yaDescubierto: boolean;
    nivelDescubierto: NivelCapa;
    narrativaGenerada: string;
    recompensas: RecompensaDTO[];
    nuevaCapaDesbloqueada: NivelCapaDTO | null;
}

/**
 * Recompensa obtenida
 */
export interface RecompensaDTO {
    tipo: string;  // PUNTOS, EXPERIENCIA, BONUS_CULTURAL, etc.
    cantidad: number;
    descripcion: string;
}

// ========================================
// DTOs PARA SISTEMA DE CAPAS
// ✅ ESTAS SON LAS INTERFACES QUE FALTABAN
// ========================================

/**
 * Capa de un punto con progreso detallado
 */
export interface CapaPuntoDTO {
    id: number;
    nivel: 'SUPERFICIE' | 'INCA' | 'CANARI' | 'ANCESTRAL';
    nombreNivel: string;
    epoca: string;
    nombreEspiritu: string;
    nombreEspirituKichwa: string;

    // Estado
    desbloqueada: boolean;
    porcentajeCompletado: number;
    medalla: 'SIN_MEDALLA' | 'BRONCE' | 'PLATA' | 'ORO';

    // Progreso detallado
    narrativaLeida: boolean;
    fotosCompletadas: number;
    fotosTotales: number;
    fotosFaltantes?: string[];
    dialogosRealizados: number;
    dialogosTotales: number;

    // Contenido
    objetivosFotograficos: ObjetivoFotograficoDTO[];
    misionActiva?: string;
    misionProgreso?: number;
    mision?: MisionDTO;
}

/**
 * Objetivo fotográfico
 * ✅ AHORA ESTÁ AQUÍ, NO EN EL COMPONENTE
 */
export interface ObjetivoFotograficoDTO {
    id: number;
    descripcion: string;
    rareza: 'COMUN' | 'POCO_COMUN' | 'RARA' | 'EPICA' | 'LEGENDARIA';
    puntosRecompensa: number;
    completado: boolean;
    imagenUrl?: string;
    fechaCaptura?: string;
}

/**
 * Misión vinculada a una capa
 */
export interface MisionDTO {
    id: number;
    titulo: string;
    descripcion: string;
    progreso: number;
    tareas: TareaMisionDTO[];
}

/**
 * Tarea de una misión
 */
export interface TareaMisionDTO {
    descripcion: string;
    completada: boolean;
}

// ========================================
// DTOs LEGACY (mantener compatibilidad)
// ========================================

export interface PuntoInteres {
    id: number;
    nombre: string;
    nombreKichwa: string;
    coordenadas: { x: number; y: number };
    imagenUrl: string;
    categoria: CategoriaPunto;
    desbloqueado: boolean;
    visitado: boolean;
    nivelDescubrimiento: NivelDescubrimiento;
    descripcionCorta: string;
    requisitos?: number[];
}

export interface ProgresoExploracion {
    usuarioId: number;
    nivelActual: NivelCapa;
    puntosVisitados: number;
    artefactosEncontrados: number;
    experienciaTotal: number;
}

export interface NarrativaGenerada {
    puntoInteresId: number;
    texto: string;
    nivel: NivelDescubrimiento;
    elementosClave: string[];
    timestamp: Date;
}
export interface DialogarEspirituRequest {
    jugadorId: string;      // String
    capaId: number;         // Long (en Kotlin)
    pregunta: string;       // String
    partidaId: number;      // Long
    nivelCapa: NivelCapa;   // Enum
    puntoInteresId: number; // Long
}
