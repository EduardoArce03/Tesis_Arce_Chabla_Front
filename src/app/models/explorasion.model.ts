// exploracion_final.model.ts - MODELOS ACTUALIZADOS Y CORREGIDOS

// ========================================
// ENUMS - Deben coincidir EXACTAMENTE con Kotlin
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

export enum EstadoMision {
    ACTIVA = 'ACTIVA',
    COMPLETADA = 'COMPLETADA',
    FALLIDA = 'FALLIDA',
    BLOQUEADA = 'BLOQUEADA'
}

export enum TipoMision {
    DESCUBRIMIENTO = 'DESCUBRIMIENTO',
    FOTOGRAFIA = 'FOTOGRAFIA',
    DIALOGO = 'DIALOGO',
    EXPLORACION_COMPLETA = 'EXPLORACION_COMPLETA'
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
    imagenUrl: string;

    // Ubicación para el mapa SVG
    coordenadaX: number;
    coordenadaY: number;

    // Clasificación
    categoria: CategoriaPunto;
    nivelRequerido: number;
    puntosPorDescubrir: number;

    // Estado actual del usuario
    desbloqueado: boolean;
    visitado: boolean;
    nivelDescubrimiento: NivelDescubrimiento | null; // ✅ Ahora es NivelCapa, NO NivelDescubrimiento
    visitas: number;
    tiempoExplorado: number;
    quizCompletado: boolean;

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

    // Actividades
    misionesCompletadas: number;
    fotografiasCapturadas: number;
    fotosRaras: number;
    fotosLegendarias: number;
    dialogosRealizados: number;

    // Nivel de arqueólogo
    nivelArqueologo: number;
    nombreNivelArqueologo: string;
    experienciaTotal: number;
    experienciaParaSiguienteNivel: number;

    // Capas desbloqueadas
    capas: NivelCapaDTO[];

    // Fechas
    fechaInicio: string;
    ultimaActividad: string;

    // Puntos totales acumulados
    puntosTotal: number;
}

/**
 * Información de una capa temporal global
 */
export interface NivelCapaDTO {
    nivel: NivelCapa;
    nombre: string;
    descripcion: string;
    desbloqueada: boolean;
    porcentajeDescubrimiento: number;
    fechaDesbloqueo?: string;
    puntosDescubiertos?: number;
    puntosTotales?: number;
}

// ========================================
// DTOs PARA SISTEMA DE CAPAS POR PUNTO
// ========================================
export interface MarcarObjetivoManualRequest {
    partidaId: number;
    objetivoId: number;
}

export interface MarcarObjetivoManualResponse {
    exito: boolean;
    mensaje: string;
    recompensas: RecompensaDTO[];
}
/**
 * ✅ Capa de un punto específico con progreso detallado
 * Este DTO viene del backend ExploracionCapasService
 */
export interface CapaPuntoDTO {
    id: number;
    nivelCapa: NivelCapa;
    nombre: string;
    descripcion: string;
    desbloqueada: boolean;
    nivelDescubrimiento: NivelDescubrimiento; // NO_VISITADO, BRONCE, PLATA, ORO
    porcentajeCompletitud: number; // 0-100

    // Estado de actividades
    narrativaLeida: boolean;
    narrativaTexto: string | null;

    fotografiasRequeridas: number;
    fotografiasCompletadas: number;
    fotografiasPendientes: FotografiaObjetivoSimpleDTO[];

    dialogosRealizados: number;
    tieneDialogoDisponible: boolean;

    misionAsociada: MisionDTO | null;
    misionCompletada: boolean;

    // Recompensas
    puntosGanados: number;
    recompensaFinal: RecompensaDTO | null;
}

/**
 * DTO simplificado para objetivos fotográficos
 */
export interface FotografiaObjetivoSimpleDTO {
    id: number;
    descripcion: string;
    rareza: string;
    completada: boolean;
}

/**
 * Objetivo fotográfico completo
 */
export interface ObjetivoFotograficoDTO {
    id: number;
    puntoInteresId: number;
    nombrePunto: string;
    descripcion: string;
    rareza: RarezaFoto;
    puntosRecompensa: number;
    yaCapturada: boolean;
}

/**
 * Misión vinculada a una capa
 */
export interface MisionDTO {
    id: number;
    titulo: string;
    descripcion: string;
    tipo: TipoMision;
    estado: EstadoMision;
    progreso: number;
    objetivo: number;
    recompensaPuntos: number;
    fechaLimite: string | null;
}

/**
 * Recompensa obtenida
 */
export interface RecompensaDTO {
    tipo: string;
    cantidad: number;
    descripcion: string;
}

// ========================================
// REQUEST DTOs
// ========================================

/**
 * Request para descubrir un punto
 */
export interface DescubrirPuntoRequest {
    partidaId: number;
    puntoId: number;
}

/**
 * ✅ Request para descubrir una capa de un punto
 */
export interface DescubrirCapaPuntoRequest {
    partidaId: number;
    puntoId: number;
    nivelCapa: NivelCapa;
}

// ========================================
// RESPONSE DTOs
// ========================================

/**
 * Response al descubrir un punto
 */
export interface DescubrirPuntoResponse {
    puntoId: number;
    nombrePunto: string;
    yaDescubierto: boolean;
    nivelDescubierto: NivelCapa;
    narrativaGenerada: string | null;
    recompensas: RecompensaDTO[];
    nuevaCapaDesbloqueada: NivelCapaDTO | null;
}

/**
 * ✅ Response al descubrir una capa de un punto
 */
export interface DescubrirCapaPuntoResponse {
    exito: boolean;
    capa: CapaPuntoDTO;
    narrativaNueva: boolean;
    mensaje: string;
}

// ========================================
// DTOs AUXILIARES PARA UI
// ========================================

/**
 * Vista de capa activa para el modal
 */
export interface VistaCapaActiva {
    punto: {
        id: number;
        nombre: string;
        nombreKichwa?: string;
        imagenUrl: string;
        categoria: CategoriaPunto;
    };
    capa: CapaPuntoDTO;
    modo: 'narrativa' | 'fotografia' | 'dialogo' | 'resumen';
}

/**
 * Fotografía capturada
 */
export interface FotografiaCapturadaDTO {
    id: number;
    objetivoId: number;
    descripcionObjetivo: string;
    puntoInteresNombre: string;
    imagenUrl: string;
    descripcionUsuario: string | null;
    descripcionIA: string;
    rareza: RarezaFoto;
    puntuacionIA: number;
    fecha: string;
}

/**
 * Diálogo en historial
 */
export interface DialogoHistorialDTO {
    id: number;
    pregunta: string;
    respuesta: string;
    nivelCapa: NivelCapa;
    fecha: string;
    puntoInteresNombre: string | null;
}
