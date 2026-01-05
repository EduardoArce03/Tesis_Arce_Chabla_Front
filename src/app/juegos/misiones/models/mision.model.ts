export interface ListaMisionesResponse {
    disponibles: MisionCardDTO[];
    enProgreso: MisionCardDTO[];
    completadas: MisionCardDTO[];
    bloqueadas: MisionCardDTO[];
    estadisticas: EstadisticasMisionesDTO;
}

export interface MisionCardDTO {
    id: number;
    titulo: string;
    tituloKichwa: string;
    descripcionCorta: string;
    imagenPortada: string;
    dificultad: DificultadMision;
    tiempoEstimado: number;
    estado: EstadoMision;
    npcGuia: NPCGuiaDTO;
    recompensas: RecompensasDTO;
    requisitos: RequisitosDTO;
    progreso: ProgresoMisionDTO | null;
}

export interface NPCGuiaDTO {
    nombre: string;
    nombreKichwa: string;
    avatar: string;
}

export interface RecompensasDTO {
    experiencia: number;
    puntos: number;
    insignias: InsigniaDTO[];
}

export interface RequisitosDTO {
    nivelMinimo: number;
    misionesPrevias: number[] | null;
    insignias: string[] | null;
}

export interface ProgresoMisionDTO {
    faseActual: number;
    totalFases: number;
    puntuacion: number;
    intentos: number;
    respuestasCorrectas: number;
    respuestasIncorrectas: number;
    porcentajeCompletado: number;
}

export interface EstadisticasMisionesDTO {
    completadas: number;
    enProgreso: number;
    insigniasObtenidas: number;
    totalMisiones: number;
    porcentajeCompletado: number;
}

export interface DetalleMisionResponse {
    mision: MisionDetalleDTO;
    fases: FaseDTO[];
    progreso: ProgresoMisionDTO | null;
    puedeIniciar: boolean;
    motivoBloqueo: string | null;
}

export interface MisionDetalleDTO {
    id: number;
    titulo: string;
    tituloKichwa: string;
    descripcionCorta: string;
    descripcionLarga: string;
    imagenPortada: string;
    dificultad: DificultadMision;
    tiempoEstimado: number;
    npcGuia: NPCGuiaDTO;
    npcDialogoInicial: string;
    recompensas: RecompensasDTO;
    requisitos: RequisitosDTO;
}

export interface FaseDTO {
    id: number;
    numeroFase: number;
    titulo: string;
    descripcion: string;
    tipoFase: TipoFase;
    puntoInteresId: number | null;
    experienciaFase: number;
    completada: boolean;
}

export interface IniciarMisionResponse {
    usuarioMisionId: number;
    misionId: number;
    faseActual: FaseEjecucionDTO;
    mensaje: string;
}

export interface FaseEjecucionDTO {
    numeroFase: number;
    titulo: string;
    descripcion: string;
    tipoFase: TipoFase;
    contenido: ContenidoFaseDTO;
}

export type ContenidoFaseDTO =
    | DialogoContenido
    | QuizContenido
    | VisitarPuntoContenido
    | BuscarArtefactoContenido
    | ExploracionLibreContenido
    | DecisionContenido;

export interface DialogoContenido {
    type: 'DIALOGO';
    npcNombre: string;
    npcAvatar: string;
    dialogo: string;
}

export interface QuizContenido {
    type: 'QUIZ';
    preguntas: PreguntaDTO[];
}

export interface VisitarPuntoContenido {
    type: 'VISITAR_PUNTO';
    puntoInteresId: number;
    puntoNombre: string;
    instrucciones: string;
}

export interface BuscarArtefactoContenido {
    type: 'BUSCAR_ARTEFACTO';
    artefactoId: number;
    artefactoNombre: string;
    puntoInteresId: number;
    pista: string;
}

export interface ExploracionLibreContenido {
    type: 'EXPLORACION_LIBRE';
    tiempoRequerido: number;
    areaSugerida: string;
}

export interface DecisionContenido {
    type: 'DECISION';
    situacion: string;
    opciones: OpcionDecisionDTO[];
}

export interface PreguntaDTO {
    id: number;
    pregunta: string;
    opciones: OpcionDTO[];
    puntos: number;
}

export interface OpcionDTO {
    letra: string;
    texto: string;
}

export interface OpcionDecisionDTO {
    id: string;
    texto: string;
    consecuencia: string;
}

export interface ResponderFaseRequest {
    usuarioMisionId: number;
    faseId: number;
    respuestas?: RespuestaDTO[];
    puntoVisitadoId?: number;
    artefactoEncontradoId?: number;
    tiempoExploracion?: number;
    decisionId?: string;
}

export interface RespuestaDTO {
    preguntaId: number;
    respuesta: string;
}

export interface ResponderFaseResponse {
    faseCompletada: boolean;
    correctas: number;
    incorrectas: number;
    puntuacion: number;
    experienciaGanada: number;
    retroalimentacion: RetroalimentacionDTO[];
    siguienteFase: FaseEjecucionDTO | null;
    misionCompletada: boolean;
    insigniasObtenidas: InsigniaDTO[];
}

export interface RetroalimentacionDTO {
    pregunta: string;
    respuestaUsuario: string;
    respuestaCorrecta: string;
    esCorrecta: boolean;
    explicacion: string;
}

export interface InsigniaDTO {
    id: number;
    codigo: string;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    icono: string;
    rareza: RarezaInsignia;
    fechaObtencion: string | null;
    obtenida: boolean;
}

export interface ColeccionInsigniasResponse {
    insignias: InsigniaDTO[];
    totalObtenidas: number;
    totalDisponibles: number;
    porcentajeCompletado: number;
}

// Enums
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
    COMPLETADA = 'COMPLETADA'
}

export enum TipoFase {
    DIALOGO = 'DIALOGO',
    QUIZ = 'QUIZ',
    VISITAR_PUNTO = 'VISITAR_PUNTO',
    BUSCAR_ARTEFACTO = 'BUSCAR_ARTEFACTO',
    EXPLORACION_LIBRE = 'EXPLORACION_LIBRE',
    DECISION = 'DECISION'
}

export enum RarezaInsignia {
    COMUN = 'COMUN',
    RARA = 'RARA',
    EPICA = 'EPICA',
    LEGENDARIA = 'LEGENDARIA'
}

// Tipo auxiliar para el servicio
export type Mision = MisionCardDTO;
