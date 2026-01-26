class Requisito {}

class Dificultad {}

export interface Juego {
    id: number;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    tipo: TipoJuego;
    dificultad: Dificultad;
    categoriasCulturales: CategoriasCultural[];
    puntosRecompensa: number;
    experienciaRecompensa: number;
    tiempoEstimado: number; // en minutos
    bloqueado: boolean;
    requisitos: Requisito[];
}

export enum TipoJuego {
    MEMORIA = 'MEMORIA',
    QUIZ = 'QUIZ',
    PUZZLE = 'PUZZLE',
    RITMO = 'RITMO',
    EXPLORACION = 'EXPLORACION',
    NARRATIVA = 'NARRATIVA'
}

export enum CategoriasCultural {
    VESTIMENTA = 'VESTIMENTA',
    MUSICA = 'MUSICA',
    //LENGUAJE = 'LENGUAJE',
    FESTIVIDADES = 'FESTIVIDADES',
    LUGARES = 'LUGARES',
    //LEYENDAS = 'LEYENDAS',
    //GASTRONOMIA = 'GASTRONOMIA',
    //ARTESANIA = 'ARTESANIA'
}

export enum TipoHint {
    DESCRIPCION_CONTEXTUAL = 'DESCRIPCION_CONTEXTUAL',
    PISTA_VISUAL = 'PISTA_VISUAL',
    CATEGORIA_CULTURAL = 'CATEGORIA_CULTURAL'
}

export enum TipoDialogo {
    PAREJA_PERFECTA = 'PAREJA_PERFECTA',
    PRIMER_DESCUBRIMIENTO = 'PRIMER_DESCUBRIMIENTO',
    COMBO_ACTIVO = 'COMBO_ACTIVO'
}

export enum NivelDificultad {
    FACIL = 'FACIL',
    MEDIO = 'MEDIO',
    DIFICIL = 'DIFICIL'
}

// Elemento Cultural
export interface ElementoCultural {
    id: number;
    nombreKichwa: string;
    nombreEspanol: string;
    imagenUrl: string;
    categoria: CategoriasCultural;
    descripcion?: string;
}

export interface CrearElementoCulturalRequest {
    nombreKichwa: string;
    nombreEspanol: string;
    imagenUrl: string;
    categoria: CategoriasCultural;
    descripcion?: string;
}

// Partida
export interface IniciarPartidaRequest {
    jugadorId: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
}

export interface IniciarPartidaResponse {
    partidaId: number;
    elementos: ElementoCultural[];
}

export interface FinalizarPartidaRequest {
    partidaId: number;
    intentos: number;
    tiempoSegundos: number;
}

export interface PartidaResponse {
    id: number;
    jugadorId: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    intentos: number;
    tiempoSegundos: number;
    puntuacion: number;
    completada: boolean;
    fechaInicio: string;
    fechaFin?: string;
}

export interface EstadisticasJugadorResponse {
    jugadorId: string;
    totalPartidas: number;
    partidasCompletadas: number;
    puntuacionPromedio: number;
    mejorPuntuacion?: number;
    tiempoPromedioSegundos: number;
    intentosPromedio: number;
}

export interface RankingResponse {
    posicion: number;
    jugadorId: string;
    puntuacion: number;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    tiempoSegundos: number;
    fecha: string;
    nombreJugador: string;
}

// Tarjeta para el juego (frontend only)
export interface TarjetaMemoria {
    id: number;
    elementoId: number;
    imagen: string;
    nombreKichwa: string;
    nombreEspanol: string;
    categoria: CategoriasCultural;
    volteada: boolean;
    emparejada: boolean;
}

export interface EstadoVidas {
    vidasActuales: number;
    vidasMaximas: number;
    erroresConsecutivos: number;
}

export interface EstadoCombo {
    parejasConsecutivas: number;
    multiplicador: number;
    comboActivo: boolean;
    mejorCombo: number;
}

export interface HintDisponible {
    costo: number;
    usosRestantes: number;
    mensaje?: string;
}

export interface EstadoPartida {
    vidas: EstadoVidas;
    combo: EstadoCombo;
    hints: HintDisponible;
}

export interface NarrativaEducativa {
    titulo: string;
    descripcion: string;
    nombreKichwa: string;
    nombreEspanol: string;
    preguntaRecuperacion?: PreguntaRecuperacion;
}

export interface PreguntaRecuperacion {
    pregunta: string;
    opciones: string[];
    respuestaCorrecta: number;
    explicacion: string;
}

export interface DialogoCultural {
    textoKichwa: string;
    textoEspanol: string;
    tipo: string;
}

export interface Insignia {
    nombre: string;
    nombreKichwa: string;
    icono: string;
    descripcion: string;
}

export interface EstadisticasDetalladas {
    precision: number;
    mejorCombo: number;
    vidasRestantes: number;
    hintsUsados: number;
    tiempoTotal: number;
    nuevosDescubrimientos: number;
}

// ==================== REQUESTS ====================

export interface IniciarPartidaRequest {
    jugadorId: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
}

export interface FinalizarPartidaRequest {
    partidaId: number;
    intentos: number;
    tiempoSegundos: number;
}

export interface ProcesarErrorRequest {
    partidaId: number;
    elementoId: number;
}

export interface ProcesarParejaRequest {
    partidaId: number;
    elementoId: number;
}

export interface SolicitarHintRequest {
    partidaId: number;
    tipoHint: TipoHint;
}

export interface ResponderPreguntaRequest {
    partidaId: number;
    elementoId: number;
    respuestaSeleccionada: number;
}

// ==================== RESPONSES ====================

export interface IniciarPartidaResponse {
    partidaId: number;
    elementos: ElementoCultural[];
    estadoInicial: EstadoPartida;
}

export interface PartidaResponse {
    id: number;
    jugadorId: string;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    intentos: number;
    tiempoSegundos: number;
    puntuacion: number;
    completada: boolean;
    fechaInicio: string;
    fechaFin?: string;
}

export interface ProcesarErrorResponse {
    vidasRestantes: number;
    comboRoto: boolean;
    narrativa: NarrativaEducativa;
    estadoActualizado: EstadoPartida;
    mostrarPregunta: boolean;
}

export interface ProcesarParejaResponse {
    comboActual: number;
    multiplicador: number;
    dialogo?: DialogoCultural;
    esPrimerDescubrimiento: boolean;
    estadoActualizado: EstadoPartida;
}

export interface SolicitarHintResponse {
    mensaje: string;
    costoPuntos: number;
    usosRestantes: number;
    estadoActualizado: EstadoPartida;
}

export interface ResponderPreguntaResponse {
    esCorrecta: boolean;
    vidaRecuperada: boolean;
    vidasActuales: number;
    explicacion: string;
    estadoActualizado: EstadoPartida;
}

export interface FinalizarPartidaResponse {
    puntuacion: number;
    insignias: Insignia[];
    estadisticas: EstadisticasDetalladas;
}

export interface EstadisticasJugadorResponse {
    jugadorId: string;
    totalPartidas: number;
    partidasCompletadas: number;
    puntuacionPromedio: number;
    mejorPuntuacion?: number;
    tiempoPromedioSegundos: number;
    intentosPromedio: number;
}

export interface RankingResponse {
    posicion: number;
    jugadorId: string;
    puntuacion: number;
    nivel: NivelDificultad;
    categoria: CategoriasCultural;
    tiempoSegundos: number;
    fecha: string;
}
