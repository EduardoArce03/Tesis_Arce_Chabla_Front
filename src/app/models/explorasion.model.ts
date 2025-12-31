export interface DashboardExploracionResponse {
    progreso: ProgresoExploracionDTO;
    puntosDescubiertos: PuntoInteresDTO[];
    puntosDisponibles: PuntoInteresDTO[];
    misionesActivas: MisionDTO[];
    artefactosRecientes: ArtefactoDTO[];
    estadisticas: EstadisticasExploracionDTO;
}

export interface ProgresoExploracionDTO {
    nivelArqueologo: number;
    experienciaActual: number;
    experienciaParaSiguienteNivel: number;
    porcentajeProgreso: number;
    puntosDescubiertos: number;
    totalPuntos: number;
    artefactosEncontrados: number;
    totalArtefactos: number;
    misionesCompletadas: number;
}

export interface PuntoInteresDTO {
    id: number;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    imagenUrl: string;
    coordenadaX: number;
    coordenadaY: number;
    categoria: CategoriaPunto;
    nivelRequerido: number;
    puntosPorDescubrir: number;
    desbloqueado: boolean;
    visitado: boolean;
    nivelDescubrimiento: NivelDescubrimiento;
    visitas: number;
    tiempoExplorado: number;
    quizCompletado: boolean;
    artefactosDisponibles: number;
    artefactosEncontrados: number;
}

export interface MisionDTO {
    id: number;
    titulo: string;
    descripcion: string;
    tipo: TipoMision;
    objetivo: ObjetivoMisionDTO;
    progresoActual: ProgresoMisionDTO;
    recompensaXP: number;
    recompensaPuntos: number;
    nivelRequerido: number;
    completada: boolean;
    fechaInicio: string | null;
    diasRestantes: number | null;
}

export interface ObjetivoMisionDTO {
    descripcion: string;
    puntosObjetivo: number[] | null;
    cantidadRequerida: number | null;
    tiempoRequerido: number | null;
}

export interface ProgresoMisionDTO {
    puntosVisitados: number[];
    artefactosEncontrados: number;
    quizzesCompletados: number;
    tiempoExplorado: number;
    porcentajeCompletado: number;
}

export interface ArtefactoDTO {
    id: number;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    imagenUrl: string;
    categoria: CategoriaArtefacto;
    rareza: number;
    encontrado: boolean;
    fechaEncontrado: string | null;
    cantidad: number;
    puntoInteres: string;
}

export interface EstadisticasExploracionDTO {
    tiempoTotalExploracion: number;
    visitasTotales: number;
    quizzesRespondidos: number;
    quizzesCorrectos: number;
    tasaAcierto: number;
    artefactosPorCategoria: Record<CategoriaArtefacto, number>;
    puntosFavorito: PuntoInteresDTO | null;
}

export interface DetallePuntoResponse {
    punto: PuntoInteresDTO;
    narrativa: NarrativaDTO;
    quiz: PreguntaQuizDTO[] | null;
    artefactosDisponibles: ArtefactoDTO[];
    historiaCompleta: string;
}

export interface NarrativaDTO {
    texto: string;
    nivel: NivelDescubrimiento;
    generadaPorIA: boolean;
}

export interface PreguntaQuizDTO {
    id: number;
    pregunta: string;
    opciones: OpcionQuizDTO[];
    dificultad: number;
}

export interface OpcionQuizDTO {
    letra: string;
    texto: string;
}

export interface VisitarPuntoRequest {
    usuarioId: number;
    puntoId: number;
    tiempoSegundos: number;
}

export interface VisitaPuntoResponse {
    descubrimiento: DescubrimientoDTO;
    artefactoEncontrado: ArtefactoDTO | null;
    experienciaGanada: number;
    nivelSubido: boolean;
    nuevoNivel: number | null;
    misionesActualizadas: MisionDTO[];
}

export interface DescubrimientoDTO {
    puntoId: number;
    nombrePunto: string;
    nivelDescubrimiento: NivelDescubrimiento;
    nivelAnterior: NivelDescubrimiento;
    visitas: number;
    tiempoTotal: number;
    quizCompletado: boolean;
}

export interface ResponderQuizRequest {
    usuarioId: number;
    puntoId: number;
    preguntaId: number;
    respuesta: string;
}

export interface ResultadoQuizResponse {
    correcto: boolean;
    explicacion: string;
    experienciaGanada: number;
    puntoDesbloqueado: boolean;
}

export interface BuscarArtefactoRequest {
    usuarioId: number;
    puntoId: number;
}

export interface ResultadoBusquedaResponse {
    encontrado: boolean;
    artefacto: ArtefactoDTO | null;
    mensaje: string;
    experienciaGanada: number;
}

// Enums
export enum CategoriaPunto {
    TEMPLO = 'TEMPLO',
    PLAZA = 'PLAZA',
    VIVIENDA = 'VIVIENDA',
    DEPOSITO = 'DEPOSITO',
    OBSERVATORIO = 'OBSERVATORIO',
    CEREMONIAL = 'CEREMONIAL',
    CAMINO = 'CAMINO',
    FUENTE = 'FUENTE'
}

export enum NivelDescubrimiento {
    NO_VISITADO = 'NO_VISITADO',
    BRONCE = 'BRONCE',
    PLATA = 'PLATA',
    ORO = 'ORO'
}

export enum CategoriaArtefacto {
    CERAMICA = 'CERAMICA',
    TEXTIL = 'TEXTIL',
    METAL = 'METAL',
    PIEDRA = 'PIEDRA',
    HERRAMIENTA = 'HERRAMIENTA',
    ORNAMENTO = 'ORNAMENTO',
    RITUAL = 'RITUAL'
}

export enum TipoMision {
    DESCUBRIR_PUNTOS = 'DESCUBRIR_PUNTOS',
    ENCONTRAR_ARTEFACTOS = 'ENCONTRAR_ARTEFACTOS',
    COMPLETAR_QUIZ = 'COMPLETAR_QUIZ',
    TIEMPO_EXPLORACION = 'TIEMPO_EXPLORACION',
    SECUENCIAL = 'SECUENCIAL'
}
