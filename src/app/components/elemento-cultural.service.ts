import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ElementoCultural, 
  CrearElementoCulturalRequest,
  CategoriasCultural 
} from '../models/juego.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ElementoCulturalService {
  private apiUrl = `${environment.apiUrl}/elementos-culturales`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los elementos culturales activos
   */
  obtenerTodos(): Observable<ElementoCultural[]> {
    return this.http.get<ElementoCultural[]>(this.apiUrl);
  }

  /**
   * Obtiene elementos culturales por categoría
   */
  obtenerPorCategoria(categoria: CategoriasCultural): Observable<ElementoCultural[]> {
    return this.http.get<ElementoCultural[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  /**
   * Obtiene un elemento cultural por ID
   */
  obtenerPorId(id: number): Observable<ElementoCultural> {
    return this.http.get<ElementoCultural>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene elementos culturales aleatorios de una categoría
   */
  obtenerAleatorios(categoria: CategoriasCultural, cantidad: number = 6): Observable<ElementoCultural[]> {
    return this.http.get<ElementoCultural[]>(
      `${this.apiUrl}/aleatorios/${categoria}?cantidad=${cantidad}`
    );
  }

  /**
   * Crea un nuevo elemento cultural
   */
  crear(request: CrearElementoCulturalRequest): Observable<ElementoCultural> {
    return this.http.post<ElementoCultural>(this.apiUrl, request);
  }

  /**
   * Actualiza un elemento cultural existente
   */
  actualizar(id: number, request: CrearElementoCulturalRequest): Observable<ElementoCultural> {
    return this.http.put<ElementoCultural>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Elimina (desactiva) un elemento cultural
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
