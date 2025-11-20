import { Documentation } from '@/pages/documentation/documentation';
import { Crud } from '@/pages/crud/crud';
import { Empty } from '@/pages/empty/empty';
import { Routes } from '@angular/router';
import { MemoriaCulturalComponent } from '@/juegos/memoria-cultural/memoria-cultural.component';

export default [
    { path: 'memoria', component: MemoriaCulturalComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
