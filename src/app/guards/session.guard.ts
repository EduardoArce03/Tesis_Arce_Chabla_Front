import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { SesionService } from '@/services/sesion.service';

/**
 * Guard para proteger rutas que requieren sesión activa
 */
export const sesionGuard: CanActivateFn = (route, state) => {
    const sesionService = inject(SesionService);
    const router = inject(Router);

    if (sesionService.haySesion()) {
        return true;
    } else {
        // Redirigir a la página de bienvenida
        router.navigate(['/bienvenida']);
        return false;
    }
};

/**
 * Guard inverso: redirige al dashboard si ya hay sesión
 * Útil para la página de bienvenida
 */
export const noSesionGuard: CanActivateFn = (route, state) => {
    const sesionService = inject(SesionService);
    const router = inject(Router);

    if (!sesionService.haySesion()) {
        return true;
    } else {
        // Si ya hay sesión, redirigir al dashboard
        router.navigate(['/']);
        return false;
    }
};
