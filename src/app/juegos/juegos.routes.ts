// src/app/juegos/juegos.routes.ts
import { Routes } from '@angular/router';

export default [
    {
        path: '',
        redirectTo: 'misiones',
        pathMatch: 'full'
    },

    // ========== MISIONES ==========

    {
        path: 'misiones/:id',
        loadComponent: () => import('./misiones/components/detalle-mision/detalle-mision.component')
            .then(m => m.DetalleMisionComponent)
    },

    {
        path: 'misiones',
        loadComponent: () => import('./misiones/components/lista-misiones/lista-misiones.component')
            .then(m => m.ListaMisionesComponent)
    },

    // ========== EXPLORACIÓN (FLUJO COMPLETO CON CAPAS) ==========
    {
        path: 'exploracion',
        loadComponent: () => import('./mapa-ingapirca/mapa-ingapirca.component')
            .then(m => m.MapaIngapircaComponent)
    },

    // ========== MINI-JUEGOS ==========
    {
        path: 'memoria-cultural',
        loadComponent: () => import('./memoria-cultural/memoria-cultural.component')
            .then(m => m.MemoriaCulturalComponent)
    },

    {
        path: 'rompe-cabezas',
        loadComponent: () => import('./rompe-cabezas/rompe-cabezas.component')
            .then(m => m.RompeCabezasComponent)
    },

    // ========== RANKING Y ESTADÍSTICAS ==========
    {
        path: 'ranking',
        loadComponent: () => import('../components/ranking/ranking.component')
            .then(m => m.RankingComponent)
    },

    {
        path: 'estadisticas',
        loadComponent: () => import('../components/estadisticas/estadisticas-jugador.component')
            .then(m => m.EstadisticasJugadorComponent)
    },

    // ========== FALLBACK ==========
    {
        path: '**',
        redirectTo: '/notfound'
    }
] as Routes;
