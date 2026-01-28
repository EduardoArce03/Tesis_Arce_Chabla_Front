// exploracion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

// ==================== INTERFACES ====================

export interface PartidaDTO {
    id: number;
    jugadorId: number;
    puntosExplorados: number;
    fotografiasCapturadas: number;
    dialogosRealizados: number;
    puntuacionTotal: number;
    completada: boolean;
    fechaInicio: string;
    fechaFin?: string;
}

export interface MapaDTO {
    partidaId: number;
    jugadorId: number;
    puntos: PuntoDTO[];
    puntosExplorados: number;
    fotografiasCapturadas: number;
    dialogosRealizados: number;
    puntuacionTotal: number;
    completada: boolean;
}

export interface PuntoDTO {
    id: number;
    nombre: string;
    descripcion: string;
    coordenadaX: number;
    coordenadaY: number;
    imagenUrl: string;
    explorado: boolean;
    capas: CapaDTO[];
}

export interface CapaDTO {
    id: number;
    nivel: CapaNivel;
    nombre: string;
    desbloqueada: boolean;
    completada: boolean;
    narrativaLeida: boolean;
    fotografiasCompletadas: number;
    fotografiasRequeridas: number;
    dialogosRealizados: number;
    porcentaje: number;
}

export interface NarrativaDTO {
    titulo: string;
    texto: string;
    nombreEspiritu: string;
}

export interface ObjetivoFotoDTO {
    id: number;
    descripcion: string;
    completada: boolean;
}

export interface ExplorarCapaResponse {
    exito: boolean;
    capa: CapaDTO;
    narrativa: NarrativaDTO;
    objetivosFotograficos: ObjetivoFotoDTO[];
    primerDescubrimiento: boolean;
    mensaje?: string;
}

export interface CapturarFotoResponse {
    exito: boolean;
    mensaje: string;
    fotografiasCompletadas?: number;
    fotografiasRequeridas?: number;
    puntos?: number;
    descripcionIA?: string;
}

export interface DialogarResponse {
    exito: boolean;
    respuesta: string;
    nombreEspiritu: string;
    dialogosRealizados: number;
    mensaje?: string;
}

// ==================== ENUMS ====================

export enum CapaNivel {
    ACTUAL = 'ACTUAL',
    CANARI = 'CANARI'
}

// ==================== REQUESTS ====================

export interface ExplorarCapaRequest {
    partidaId: number;
    puntoId: number;
    capaNivel: CapaNivel;
}

export interface CapturarFotoRequest {
    partidaId: number;
    progresoCapaId: number;
    objetivoId: number;
    imagenBase64?: string;
}

export interface DialogarRequest {
    partidaId: number;
    progresoCapaId: number;
    pregunta: string;
}

// ==================== SERVICE ====================

@Injectable({
    providedIn: 'root'
})
export class ExploracionService {

    private readonly API_URL = environment.apiUrl + '/exploracion';

    constructor(private http: HttpClient) {}

    // ==================== INICIAR PARTIDA ====================

    /**
     * Crea una nueva partida para el jugador
     */
    iniciarPartida(jugadorId: number): Observable<PartidaDTO> {
        console.log('🎮 Iniciando partida para jugador:', jugadorId);

        const params = new HttpParams().set('jugadorId', jugadorId.toString());

        return this.http.post<PartidaDTO>(`${this.API_URL}/iniciar`, null, { params }).pipe(
            tap(partida => {
                console.log('✅ Partida creada:', partida);
            }),
            catchError(error => {
                console.error('❌ Error iniciando partida:', error);
                return throwError(() => error);
            })
        );
    }

    // ==================== OBTENER MAPA ====================

    /**
     * Obtiene el estado completo del mapa con todos los puntos y capas
     */
    obtenerMapa(partidaId: number): Observable<MapaDTO> {
        console.log('🗺️ Obteniendo mapa de partida:', partidaId);

        return this.http.get<MapaDTO>(`${this.API_URL}/mapa/${partidaId}`).pipe(
            tap(mapa => {
                console.log('✅ Mapa obtenido:', {
                    puntos: mapa.puntos.length,
                    explorados: mapa.puntosExplorados,
                    fotos: mapa.fotografiasCapturadas
                });
            }),
            catchError(error => {
                console.error('❌ Error obteniendo mapa:', error);
                return throwError(() => error);
            })
        );
    }

    // ==================== EXPLORAR CAPA ====================

    /**
     * Entra a una capa específica de un punto
     */
    explorarCapa(request: ExplorarCapaRequest): Observable<ExplorarCapaResponse> {
        console.log('📍 Explorando capa:', request);

        return this.http.post<ExplorarCapaResponse>(`${this.API_URL}/explorar-capa`, request).pipe(
            tap(response => {
                if (response.exito) {
                    console.log('✅ Capa explorada:', {
                        nivel: response.capa.nivel,
                        primerDescubrimiento: response.primerDescubrimiento,
                        objetivos: response.objetivosFotograficos.length
                    });
                } else {
                    console.warn('⚠️ No se pudo explorar:', response.mensaje);
                }
            }),
            catchError(error => {
                console.error('❌ Error explorando capa:', error);
                return throwError(() => error);
            })
        );
    }

    // ==================== CAPTURAR FOTOGRAFÍA ====================

    /**
     * Captura una fotografía de un objetivo
     */
    capturarFotografia(request: CapturarFotoRequest): Observable<CapturarFotoResponse> {
        console.log('📸 Capturando fotografía:', {
            objetivo: request.objetivoId,
            tieneImagen: !!request.imagenBase64
        });

        return this.http.post<CapturarFotoResponse>(`${this.API_URL}/capturar-foto`, request).pipe(
            tap(response => {
                if (response.exito) {
                    console.log('✅ Fotografía capturada:', {
                        completadas: response.fotografiasCompletadas,
                        requeridas: response.fotografiasRequeridas,
                        puntos: response.puntos
                    });
                } else {
                    console.warn('⚠️ Fotografía rechazada:', response.mensaje);
                }
            }),
            catchError(error => {
                console.error('❌ Error capturando foto:', error);
                return throwError(() => error);
            })
        );
    }

    // ==================== DIALOGAR CON ESPÍRITU ====================

    /**
     * Envía una pregunta al espíritu de la capa
     */
    dialogar(request: DialogarRequest): Observable<DialogarResponse> {
        console.log('💬 Enviando pregunta:', request.pregunta.substring(0, 50) + '...');

        return this.http.post<DialogarResponse>(`${this.API_URL}/dialogar`, request).pipe(
            tap(response => {
                if (response.exito) {
                    console.log('✅ Respuesta recibida:', {
                        espiritu: response.nombreEspiritu,
                        dialogos: response.dialogosRealizados
                    });
                } else {
                    console.warn('⚠️ Error en diálogo:', response.mensaje);
                }
            }),
            catchError(error => {
                console.error('❌ Error en diálogo:', error);
                return throwError(() => error);
            })
        );
    }

    // ==================== ENDPOINTS ADICIONALES ====================

    /**
     * Obtiene información básica de la partida
     */
    obtenerPartida(partidaId: number): Observable<PartidaDTO> {
        console.log('📊 Obteniendo partida:', partidaId);

        return this.http.get<PartidaDTO>(`${this.API_URL}/partida/${partidaId}`).pipe(
            tap(partida => {
                console.log('✅ Partida obtenida:', partida);
            }),
            catchError(error => {
                console.error('❌ Error obteniendo partida:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Elimina una partida (para testing o reset)
     */
    eliminarPartida(partidaId: number): Observable<void> {
        console.log('🗑️ Eliminando partida:', partidaId);

        return this.http.delete<void>(`${this.API_URL}/partida/${partidaId}`).pipe(
            tap(() => {
                console.log('✅ Partida eliminada');
            }),
            catchError(error => {
                console.error('❌ Error eliminando partida:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Obtiene todas las partidas de un jugador
     */
    obtenerPartidasJugador(jugadorId: number): Observable<PartidaDTO[]> {
        console.log('📋 Obteniendo partidas del jugador:', jugadorId);

        return this.http.get<PartidaDTO[]>(`${this.API_URL}/jugador/${jugadorId}/partidas`).pipe(
            tap(partidas => {
                console.log('✅ Partidas obtenidas:', partidas.length);
            }),
            catchError(error => {
                console.error('❌ Error obteniendo partidas:', error);
                return throwError(() => error);
            })
        );
    }

    // ==================== UTILIDADES ====================

    /**
     * Convierte un archivo File a Base64
     */
    convertirImagenABase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Valida que la imagen no supere el tamaño máximo
     */
    validarTamanoImagen(file: File, maxSizeMB: number = 5): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }

    /**
     * Valida que sea un formato de imagen válido
     */
    validarFormatoImagen(file: File): boolean {
        const formatosValidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return formatosValidos.includes(file.type);
    }
}
