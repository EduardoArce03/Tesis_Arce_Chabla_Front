import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadisticasDetalladasResponse } from '@/models/estadisticas.model';
import { environment } from '@/env/environment';

@Injectable({
    providedIn: 'root'
})
export class EstadisticasService {
    private apiUrl = `${environment.apiUrl}/estadisticas`;

    constructor(private http: HttpClient) {}

    obtenerEstadisticasDetalladas(usuarioId: number): Observable<EstadisticasDetalladasResponse> {
        return this.http.get<EstadisticasDetalladasResponse>(`${this.apiUrl}/${usuarioId}`);
    }
}
