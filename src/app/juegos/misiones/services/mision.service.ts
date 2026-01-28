import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ListaMisionesResponse,
    DetalleMisionResponse,
    IniciarMisionResponse,
    FaseEjecucionDTO,
    ResponderFaseRequest,
    ResponderFaseResponse,
    EstadisticasMisionesDTO,
    ColeccionInsigniasResponse
} from '../models/mision.model';
import { environment } from '../../../../enviroments/environment';

@Injectable({
    providedIn: 'root'
})
export class MisionService {
    private apiUrl = `${environment.apiUrl}/misiones`;

    constructor(private http: HttpClient) {}

    // Obtener listado de misiones categorizado
    obtenerMisiones(usuarioId: number): Observable<ListaMisionesResponse> {
        return this.http.get<ListaMisionesResponse>(`${this.apiUrl}/${usuarioId}`);
    }

    // Obtener detalle de una misión específica
    obtenerDetalleMision(misionId: number, usuarioId: number): Observable<DetalleMisionResponse> {
        return this.http.get<DetalleMisionResponse>(
            `${this.apiUrl}/${misionId}/detalle?usuarioId=${usuarioId}`
        );
    }

    // Iniciar una misión
    iniciarMision(misionId: number, usuarioId: number): Observable<IniciarMisionResponse> {
        return this.http.post<IniciarMisionResponse>(
            `${this.apiUrl}/${misionId}/iniciar?usuarioId=${usuarioId}`,
            {}
        );
    }

    // Obtener fase actual
    obtenerFaseActual(usuarioMisionId: number): Observable<FaseEjecucionDTO> {
        return this.http.get<FaseEjecucionDTO>(
            `${this.apiUrl}/progreso/${usuarioMisionId}/fase-actual`
        );
    }

    // Responder/completar una fase
    responderFase(request: ResponderFaseRequest): Observable<ResponderFaseResponse> {
        return this.http.post<ResponderFaseResponse>(
            `${this.apiUrl}/responder-fase`,
            request
        );
    }

    // Obtener estadísticas generales
    obtenerEstadisticas(usuarioId: number): Observable<EstadisticasMisionesDTO> {
        return this.http.get<EstadisticasMisionesDTO>(
            `${this.apiUrl}/estadisticas/${usuarioId}`
        );
    }

    // Obtener colección de insignias
    obtenerInsignias(usuarioId: number): Observable<ColeccionInsigniasResponse> {
        return this.http.get<ColeccionInsigniasResponse>(
            `${this.apiUrl}/insignias/${usuarioId}`
        );
    }

    // Métodos adicionales para ejecución de misiones

    obtenerMisionPorId(misionId: number): Observable<any> {
        // Por ahora simulamos, luego conectaremos con el backend real
        // Este método debería devolver la misión con progreso incluido
        return this.obtenerDetalleMision(misionId, 1); // Temporal
    }

    registrarRespuesta(misionId: string, correcta: boolean): Observable<any> {
        // Simular registro de respuesta
        console.log('Registrando respuesta:', { misionId, correcta });
        return new Observable(observer => {
            observer.next({ success: true });
            observer.complete();
        });
    }

    avanzarFase(misionId: string): Observable<any> {
        // Simular avance de fase
        console.log('Avanzando fase:', misionId);
        return new Observable(observer => {
            observer.next({ success: true });
            observer.complete();
        });
    }

    usarPista(misionId: string): Observable<any> {
        // Simular uso de pista
        console.log('Usando pista:', misionId);
        return new Observable(observer => {
            observer.next({ success: true });
            observer.complete();
        });
    }

    abandonarMision(misionId: string): Observable<any> {
        // Simular abandono de misión
        console.log('Abandonando misión:', misionId);
        return new Observable(observer => {
            observer.next({ success: true });
            observer.complete();
        });
    }

    // Responder quiz con TU estructura
    responderQuiz(
        usuarioMisionId: number,
        preguntaId: number,
        respuesta: string,
        usuarioId: number,
        puntoId: number
    ): Observable<ResponderFaseResponse> {
        return this.http.post<ResponderFaseResponse>(
            `${this.apiUrl}/progreso/${usuarioMisionId}/responder-quiz`,
            {
                usuarioId,
                puntoId,
                preguntaId,
                respuesta
            }
        );
    }
}
