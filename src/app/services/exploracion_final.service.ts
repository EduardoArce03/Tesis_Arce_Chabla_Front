// exploracion.service.ts - SERVICIO COMPLETO CON TODOS LOS MÉTODOS

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, catchError, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    PuntoInteresDTO,
    ProgresoExploracionDTO,
    DescubrirPuntoRequest,
    DescubrirPuntoResponse,
    RecompensaDTO,
    NivelCapaDTO,
    CapaPuntoDTO,
    ObjetivoFotograficoDTO,
    DescubrirCapaPuntoRequest,
    DescubrirCapaPuntoResponse
} from '../models/explorasion.model';
import { environment } from '@/env/environment';

@Injectable({ providedIn: 'root' })
export class ExploracionService {
    private apiUrl = environment.apiUrl + '/exploracion';

    private progresoSubject = new BehaviorSubject<ProgresoExploracionDTO | null>(null);
    public progreso$ = this.progresoSubject.asObservable();

    constructor(private http: HttpClient) {}

    // ========================================
    // INICIALIZACIÓN
    // ========================================

    inicializarExploracion(partidaId: number, usuarioId: number): Observable<ProgresoExploracionDTO> {
        const params = new HttpParams()
            .set('partidaId', partidaId.toString())
            .set('usuarioId', usuarioId.toString());

        return this.http.post<ProgresoExploracionDTO>(
            `${this.apiUrl}/inicializar`,
            {},
            { params }
        ).pipe(
            tap(progreso => this.progresoSubject.next(progreso))
        );
    }

    obtenerProgreso(partidaId: number): Observable<ProgresoExploracionDTO> {
        return this.http.get<ProgresoExploracionDTO>(
            `${this.apiUrl}/progreso/${partidaId}`
        ).pipe(
            tap(progreso => this.progresoSubject.next(progreso))
        );
    }

    // ========================================
    // PUNTOS DE INTERÉS
    // ========================================

    obtenerPuntosDisponibles(partidaId: number): Observable<PuntoInteresDTO[]> {
        return this.http.get<PuntoInteresDTO[]>(
            `${this.apiUrl}/puntos/${partidaId}`
        );
    }

    descubrirPunto(request: DescubrirPuntoRequest): Observable<DescubrirPuntoResponse> {
        return this.http.post<DescubrirPuntoResponse>(
            `${this.apiUrl}/puntos/descubrir`,
            request
        );
    }

    // ========================================
    // CAPAS TEMPORALES GLOBALES
    // ========================================

    obtenerCapas(partidaId: number): Observable<NivelCapaDTO[]> {
        return this.http.get<NivelCapaDTO[]>(
            `${this.apiUrl}/capas/${partidaId}`
        );
    }

    // ========================================
    // 🆕 CAPAS POR PUNTO (SISTEMA NUEVO)
    // ========================================

    /**
     * 🆕 Obtener las 4 capas de un punto específico con su progreso
     * GET /puntos/{puntoId}/capas?partidaId=X
     */
    obtenerCapasPunto(puntoId: number, partidaId: number): Observable<CapaPuntoDTO[]> {
        const params = new HttpParams().set('partidaId', partidaId.toString());

        return this.http.get<CapaPuntoDTO[]>(
            `${this.apiUrl}/puntos/${puntoId}/capas`,
            { params }
        );
    }

    /**
     * 🆕 Descubrir/Entrar a una capa específica de un punto
     * POST /puntos/capa/descubrir
     */
    descubrirCapaPunto(request: DescubrirCapaPuntoRequest): Observable<DescubrirCapaPuntoResponse> {
        return this.http.post<DescubrirCapaPuntoResponse>(
            `${this.apiUrl}/puntos/capa/descubrir`,
            request
        );
    }

    // ========================================
    // FOTOGRAFÍAS
    // ========================================

    obtenerObjetivosFotograficos(
        partidaId: number,
        puntoId?: number
    ): Observable<ObjetivoFotograficoDTO[]> {
        let params = new HttpParams();
        if (puntoId) {
            params = params.set('puntoId', puntoId.toString());
        }

        return this.http.get<ObjetivoFotograficoDTO[]>(
            `${this.apiUrl}/fotografia/objetivos/${partidaId}`,
            puntoId ? { params } : {}
        );
    }

    capturarFotografia(request: {
        partidaId: number;
        objetivoId: any;
        imagenBase64: string;
        descripcionUsuario: null
    }): Observable<{
        exito: boolean;
        mensaje: string;
        fotografiaId: number | null;
        analisisIA: any;
        recompensas: RecompensaDTO[]
    }> {
        return this.http.post<any>(
            `${this.apiUrl}/fotografia/capturar`,
            request
        );
    }

    obtenerGaleriaFotografias(partidaId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.apiUrl}/fotografia/galeria/${partidaId}`
        );
    }

    // ========================================
    // DIÁLOGOS CON ESPÍRITUS
    // ========================================

    dialogarConEspiritu(request: {
        partidaId: number;
        nivelCapa: string;
        pregunta: string;
        puntoInteresId?: number;
    }): Observable<{
        exito: boolean;
        mensaje: string;
        respuestaEspiritu: string | null;
        conocimientoDesbloqueado: string | null;
    }> {
        return this.http.post<any>(
            `${this.apiUrl}/dialogo/espiritu`,
            request
        );
    }

    obtenerHistorialDialogos(
        partidaId: number,
        nivelCapa?: string
    ): Observable<any[]> {
        let params = new HttpParams();
        if (nivelCapa) {
            params = params.set('nivelCapa', nivelCapa);
        }

        return this.http.get<any[]>(
            `${this.apiUrl}/dialogo/historial/${partidaId}`,
            nivelCapa ? { params } : {}
        );
    }

    // ========================================
    // MISIONES
    // ========================================

    obtenerMisionesDisponibles(partidaId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.apiUrl}/misiones/${partidaId}`
        );
    }

    completarMision(request: {
        partidaId: number;
        misionId: number;
    }): Observable<{
        exito: boolean;
        mensaje: string;
        recompensas: RecompensaDTO[];
        nuevaCapaDesbloqueada: NivelCapaDTO | null;
    }> {
        return this.http.post<any>(
            `${this.apiUrl}/misiones/completar`,
            request
        );
    }

    generarNarrativaEducativa(
        imagenUrl: string,
        concepto: string,
        nombreKichwa: string,
        nombreEspanol: string
    ): Observable<any> {
        const formData = new FormData();

        return this.obtenerImagenComoBlob(imagenUrl).pipe(
            switchMap(blob => {
                formData.append('image', blob, 'imagen.jpg');
                formData.append('concepto', concepto);
                formData.append('nombre_kichwa', nombreKichwa);
                formData.append('nombre_espanol', nombreEspanol);

                return this.http.post(`${this.apiUrl}/narrativa-educativa`, formData);
            }),
            catchError(error => {
                console.error('Error en narrativa educativa:', error);
                return throwError(() => error);
            })
        );
    }

    private obtenerImagenComoBlob(url: string): Observable<Blob> {
        return this.http.get(url, { responseType: 'blob' });
    }
}
