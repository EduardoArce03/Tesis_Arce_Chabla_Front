import { Documentation } from '@/pages/documentation/documentation';
import { Crud } from '@/pages/crud/crud';
import { Empty } from '@/pages/empty/empty';
import { Routes } from '@angular/router';
import { MemoriaCulturalComponent } from '@/juegos/memoria-cultural/memoria-cultural.component';
import { RompeCabezasComponent } from '@/juegos/rompe-cabezas/rompe-cabezas.component';

export default [
    { path: 'memoria', component: MemoriaCulturalComponent },
    {path:'rompe-cabezas', component: RompeCabezasComponent},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
