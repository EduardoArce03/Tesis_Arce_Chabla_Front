import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CategoriasCultural } from '@/models/juego.model';
import { Insignia } from '@/models/insignia.model';

class ProgresoUsuario {}

class ResultadoJuego {}

class RankingEntry {}

class RespuestaJuego {
    nuevoProgreso: boolean | undefined;
}

@Injectable({ providedIn: 'root' })
export class GamificacionService {
    private environment: any = "{ apiUrl: 'https://tu-api.com' }"; // Reemplaza con la configuración real del entorno
    private apiUrl = this.environment.apiUrl + '/api/gamificacion';
    private progresoSubject = new BehaviorSubject<ProgresoUsuario | null>(null);
    public progreso$ = this.progresoSubject.asObservable();

    constructor(private http: HttpClient) {}

    obtenerProgreso(usuarioId: number): Observable<ProgresoUsuario> {
        return this.http.get<ProgresoUsuario>(`${this.apiUrl}/progreso/${usuarioId}`).pipe(tap((progreso) => this.progresoSubject.next(progreso)));
    }

    completarJuego(usuarioId: number, juegoId: number, resultado: ResultadoJuego): Observable<RespuestaJuego> {
        return this.http.post<RespuestaJuego>(`${this.apiUrl}/juego/completar`, resultado, { params: { usuarioId: usuarioId.toString(), juegoId: juegoId.toString() } }).pipe(
            tap((respuesta) => {
                // Actualizar progreso local
                if (respuesta.nuevoProgreso) {
                    this.progresoSubject.next(respuesta.nuevoProgreso);
                }
            })
        );
    }

    verificarInsignias(usuarioId: number): Observable<Insignia[]> {
        return this.http.post<Insignia[]>(`${this.apiUrl}/insignias/verificar`, { usuarioId });
    }

    obtenerRanking(categoria?: CategoriasCultural): Observable<RankingEntry[]> {
        const params = categoria ? { categoria } : {};
        // @ts-ignore
        return this.http.get<RankingEntry[]>(`${this.apiUrl}/ranking`, { params });
    }
}
