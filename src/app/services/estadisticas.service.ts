import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { EstadisticasDetalladasResponse } from '@/models/estadisticas.model';
import { environment } from '../../enviroments/environment';

@Injectable({
    providedIn: 'root'
})
export class EstadisticasService {
    private apiUrl = `${environment.apiUrl}/estadisticas`;

    constructor(private http: HttpClient) {}

    obtenerEstadisticasDetalladas(usuarioId: number): Observable<EstadisticasDetalladasResponse> {
        const url = `${this.apiUrl}/${usuarioId}`;

        console.log('🔍 Solicitando estadísticas para usuario:', usuarioId);
        console.log('📡 URL completa:', url);

        // ERROR CORREGIDO: Faltaba el paréntesis de apertura después de .get
        return this.http.get<EstadisticasDetalladasResponse>(`${this.apiUrl}/${usuarioId}`)
            .pipe(
                tap(response => {
                    console.log('✅ Estadísticas recibidas:', response);
                    console.log('📊 Total partidas:', response.resumenGeneral?.totalPartidas);
                    console.log('📊 Partidas completadas:', response.resumenGeneral?.partidasCompletadas);
                    console.log('📊 Puntuación total:', response.resumenGeneral?.puntuacionTotal);
                }),
                catchError(error => {
                    console.error('❌ Error al obtener estadísticas:', error);
                    console.error('📍 Usuario ID:', usuarioId);
                    console.error('📍 URL:', url);
                    console.error('📍 Status:', error.status);
                    console.error('📍 Mensaje:', error.message);
                    return throwError(() => error);
                })
            );
    }
}
