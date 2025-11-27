// src/app/juegos/juegos.routes.ts

import { Routes, UrlSegment } from '@angular/router';

// Matcher personalizado para /misiones/:id/ejecutar
function misionEjecutarMatcher(segments: UrlSegment[]) {
    // Debe tener exactamente 3 segmentos: ['misiones', 'mision-001', 'ejecutar']
    if (
        segments.length === 3 &&
        segments[0].path === 'misiones' &&
        segments[2].path === 'ejecutar'
    ) {
        return {
            consumed: segments,
            posParams: {
                id: segments[1]
            }
        };
    }
    return null;
}

// Matcher para /misiones/:id
function misionDetalleMatcher(segments: UrlSegment[]) {
    // Debe tener exactamente 2 segmentos: ['misiones', 'mision-001']
    if (
        segments.length === 2 &&
        segments[0].path === 'misiones'
    ) {
        return {
            consumed: segments,
            posParams: {
                id: segments[1]
            }
        };
    }
    return null;
}

export default [
    {
        path: '',
        redirectTo: 'misiones',
        pathMatch: 'full'
    },

    // Ruta con matcher para ejecutar
    {
        matcher: misionEjecutarMatcher,
        loadComponent: () => import('./misiones/components/ejecutar-mision/ejecutar-mision.component')
            .then(m => m.EjecutarMisionComponent)
    },

    // Ruta con matcher para detalle
    {
        matcher: misionDetalleMatcher,
        loadComponent: () => import('./misiones/components/detalle-mision/detalle-mision.component')
            .then(m => m.DetalleMisionComponent)
    },

    // Lista de misiones (sin matcher)
    {
        path: 'misiones',
        loadComponent: () => import('./misiones/components/lista-misiones/lista-misiones.component')
            .then(m => m.ListaMisionesComponent)
    },

    {
        path: 'exploracion',
        loadComponent: () => import('./mapa-ingapirca/mapa-ingapirca.component')
            .then(m => m.MapaIngapircaComponent)
    },

    {
        path: 'memoria',
        loadComponent: () => import('./memoria-cultural/memoria-cultural.component')
            .then(m => m.MemoriaCulturalComponent)
    }
] as Routes;
