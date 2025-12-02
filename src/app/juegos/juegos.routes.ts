// src/app/juegos/juegos.routes.ts
import { Routes } from '@angular/router';

export default [
    {
        path: '',
        redirectTo: 'misiones',
        pathMatch: 'full'
    },

    // ⚠️ ORDEN CRÍTICO: Rutas más específicas primero

    // 1. Ejecutar misión (más específica: 3 segmentos)
    {
        path: 'misiones/:id/ejecutar',
        loadComponent: () => import('./misiones/components/ejecutar-mision/ejecutar-mision.component')
            .then(m => m.EjecutarMisionComponent)
    },

    // 2. Detalle de misión (menos específica: 2 segmentos)
    {
        path: 'misiones/:id',
        loadComponent: () => import('./misiones/components/detalle-mision/detalle-mision.component')
            .then(m => m.DetalleMisionComponent)
    },

    // 3. Lista de misiones (sin parámetros)
    {
        path: 'misiones',
        loadComponent: () => import('./misiones/components/lista-misiones/lista-misiones.component')
            .then(m => m.ListaMisionesComponent)
    },

    // Otros juegos
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
