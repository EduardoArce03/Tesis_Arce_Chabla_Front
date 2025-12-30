import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { SesionService } from '@/services/sesion.service';
import { CrearUsuarioRequest, LoginConCodigoRequest } from '@/models/usuario.model';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        CardModule,
        DividerModule,
        MessageModule,
        ToastModule
    ],
    selector: 'app-bienvenida',
    templateUrl: './bienvenida.component.html',
    styleUrls: ['./bienvenida.component.scss'],
    providers: [MessageService]
})
export class BienvenidaComponent implements OnInit {
    // Modo: 'nuevo' o 'retorno'
    modo: 'nuevo' | 'retorno' = 'nuevo';

    // Formulario nuevo usuario
    nombre: string = '';

    // Formulario usuario retornando
    codigoJugador: string = '';

    // Estados
    cargando: boolean = false;

    constructor(
        private sesionService: SesionService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // Si ya hay sesión activa, redirigir al dashboard
        if (this.sesionService.haySesion()) {
            this.router.navigate(['/']);
        }
    }

    /**
     * Cambiar entre modo nuevo y retorno
     */
    cambiarModo(nuevoModo: 'nuevo' | 'retorno'): void {
        this.modo = nuevoModo;
        this.limpiarFormularios();
    }

    /**
     * Registrar nuevo usuario
     */
    registrarUsuario(): void {
        // Validaciones
        if (!this.nombre || this.nombre.trim().length < 2) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Nombre requerido',
                detail: 'Por favor ingresa tu nombre (mínimo 2 caracteres)',
                life: 3000
            });
            return;
        }

        if (this.nombre.trim().length > 50) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Nombre muy largo',
                detail: 'El nombre no puede tener más de 50 caracteres',
                life: 3000
            });
            return;
        }

        this.cargando = true;

        const request: CrearUsuarioRequest = {
            nombre: this.nombre.trim()
        };

        this.sesionService.registrar(request).subscribe({
            next: (response) => {
                this.cargando = false;

                // Mostrar código generado
                this.messageService.add({
                    severity: 'success',
                    summary: '¡Bienvenido!',
                    detail: response.mensaje,
                    life: 5000
                });

                // Mostrar diálogo con el código
                this.mostrarCodigoGenerado(response.codigoJugador);

                // Redirigir después de 3 segundos
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 3000);
            },
            error: (error) => {
                this.cargando = false;
                console.error('Error al registrar usuario:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'No se pudo crear el usuario',
                    life: 5000
                });
            }
        });
    }

    /**
     * Login con código existente
     */
    loginConCodigo(): void {
        // Validaciones
        if (!this.codigoJugador || this.codigoJugador.trim().length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Código requerido',
                detail: 'Por favor ingresa tu código de jugador',
                life: 3000
            });
            return;
        }

        this.cargando = true;

        const request: LoginConCodigoRequest = {
            codigoJugador: this.codigoJugador.trim().toUpperCase()
        };

        this.sesionService.loginConCodigo(request).subscribe({
            next: (response) => {
                this.cargando = false;

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Bienvenido de vuelta!',
                    detail: `Hola ${response.nombre}, continuemos aprendiendo`,
                    life: 3000
                });

                // Redirigir al dashboard
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 1500);
            },
            error: (error) => {
                this.cargando = false;
                console.error('Error al hacer login:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Código no válido',
                    detail: 'No se encontró un usuario con ese código',
                    life: 5000
                });
            }
        });
    }

    /**
     * Mostrar código generado en un toast especial
     */
    private mostrarCodigoGenerado(codigo: string): void {
        this.messageService.add({
            severity: 'info',
            summary: '📝 Guarda tu código',
            detail: `Tu código de jugador es: ${codigo}. Guárdalo para continuar tu progreso en otra ocasión.`,
            life: 8000,
            sticky: false
        });
    }

    /**
     * Limpiar formularios
     */
    private limpiarFormularios(): void {
        this.nombre = '';
        this.codigoJugador = '';
    }

    /**
     * Formatear código mientras se escribe (agregar guiones automáticamente)
     */
    formatearCodigo(): void {
        this.codigoJugador = this.codigoJugador.toUpperCase();
    }
}
