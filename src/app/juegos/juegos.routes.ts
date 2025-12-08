// src/app/juegos/juegos.routes.ts
import { Routes } from '@angular/router';
import { MemoriaCulturalComponent } from '@/juegos/memoria-cultural/memoria-cultural.component';
import { RompeCabezasComponent } from '@/juegos/rompe-cabezas/rompe-cabezas.component';

export default [
    {
        path: '',
        redirectTo: 'misiones',
        pathMatch: 'full'
    },

    {
        path: 'misiones/:id/ejecutar',
        loadComponent: () => import('./misiones/components/ejecutar-mision/ejecutar-mision.component')
            .then(m => m.EjecutarMisionComponent)
    },

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

    {
        path: 'exploracion',
        loadComponent: () => import('./mapa-ingapirca/mapa-ingapirca.component')
            .then(m => m.MapaIngapircaComponent)
    },

    {
        path: 'memoria',
        loadComponent: () => import('./memoria-cultural/memoria-cultural.component')
            .then(m => m.MemoriaCulturalComponent)
    },
    {path:'rompe-cabezas', component: RompeCabezasComponent},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
