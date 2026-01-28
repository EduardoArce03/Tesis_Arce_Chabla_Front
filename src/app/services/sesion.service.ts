import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CrearUsuarioRequest, LoginConCodigoRequest, Usuario, UsuarioResponse } from '@/models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SesionService {
    private readonly STORAGE_KEY = 'sesion_usuario';
    private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
    public usuario$ = this.usuarioSubject.asObservable();

    constructor(private http: HttpClient) {
        this.cargarSesion();
    }

    /**
     * Registrar nuevo usuario
     */
    registrar(request: CrearUsuarioRequest): Observable<UsuarioResponse> {
        return this.http.post<UsuarioResponse>(`${environment.apiUrl}/usuarios/registrar`, request)
            .pipe(
                tap(response => this.guardarSesion(response))
            );
    }

    /**
     * Login con código existente
     */
    loginConCodigo(request: LoginConCodigoRequest): Observable<UsuarioResponse> {
        return this.http.post<UsuarioResponse>(`${environment.apiUrl}/usuarios/login`, request)
            .pipe(
                tap(response => this.guardarSesion(response))
            );
    }

    /**
     * Guardar sesión en localStorage
     */
    private guardarSesion(usuario: UsuarioResponse): void {
        const sesion: Usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            codigoJugador: usuario.codigoJugador,
            fechaCreacion: usuario.fechaCreacion
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sesion));
        this.usuarioSubject.next(sesion);
    }

    /**
     * Cargar sesión desde localStorage
     */
    private cargarSesion(): void {
        const sesionStr = localStorage.getItem(this.STORAGE_KEY);
        if (sesionStr) {
            try {
                const usuario = JSON.parse(sesionStr) as Usuario;
                this.usuarioSubject.next(usuario);
            } catch (e) {
                this.cerrarSesion();
            }
        }
    }

    /**
     * Obtener usuario actual
     */
    getUsuario(): Usuario | null {
        return this.usuarioSubject.value;
    }

    /**
     * Verificar si hay sesión activa
     */
    haySesion(): boolean {
        return this.usuarioSubject.value !== null;
    }

    /**
     * Cerrar sesión
     */
    cerrarSesion(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.usuarioSubject.next(null);
    }
}
