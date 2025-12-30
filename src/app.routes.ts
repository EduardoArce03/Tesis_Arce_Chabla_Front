import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { sesionGuard, noSesionGuard } from './app/guards/session.guard';

export const appRoutes: Routes = [
    // Ruta de bienvenida (sin sesión)
    {
        path: 'bienvenida',
        loadComponent: () => import('./app/pages/bienvenida/bienvenida.component')
            .then(m => m.BienvenidaComponent),
        canActivate: [noSesionGuard]  // 👈 Si ya hay sesión, redirige al dashboard
    },

    // Rutas protegidas (requieren sesión)
    {
        path: '',
        component: AppLayout,
        canActivate: [sesionGuard],  // 👈 Protege todas las rutas hijas
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'juegos', loadChildren: () => import('./app/juegos/juegos.routes') }
        ]
    },

    // Rutas públicas
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },

    // Redirección por defecto
    { path: '**', redirectTo: '/bienvenida' }
];
