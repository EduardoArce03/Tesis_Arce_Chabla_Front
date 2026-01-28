import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '@/models/dashboard.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) {}

    obtenerDashboard(usuarioId: number): Observable<DashboardResponse> {
        return this.http.get<DashboardResponse>(`${this.apiUrl}/${usuarioId}`);
    }
}
