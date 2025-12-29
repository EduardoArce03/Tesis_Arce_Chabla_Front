// app/layout/component/app.menu.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: '📊 Panel de Control',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-home',
                        routerLink: '/'
                    }
                ]
            },
            {
                separator: true
            },
            {
                label: '🎮 Juegos Culturales',
                items: [
                    {
                        label: 'Misiones',
                        icon: 'pi pi-book',
                        routerLink: '/juegos/misiones'
                    },
                    {
                        label: 'Exploración Ingapirca',
                        icon: 'pi pi-map',
                        routerLink: '/juegos/exploracion'
                    },
                    {
                        label: 'Memoria Cultural',
                        icon: 'pi pi-th-large',
                        routerLink: '/juegos/memoria-cultural'  // 👈 Cambié de '/juegos/memoria' a '/juegos/memoria-cultural'
                    }
                ]
            },
            {
                separator: true
            },
            {
                label: '📈 Estadísticas & Ranking',
                items: [
                    {
                        label: 'Mis Estadísticas',
                        icon: 'pi pi-chart-bar',
                        routerLink: '/juegos/estadisticas'  // 👈 Nuevo
                    },
                    {
                        label: 'Tabla de Clasificación',
                        icon: 'pi pi-trophy',
                        routerLink: '/juegos/ranking'  // 👈 Nuevo
                    }
                ]
            }
        ];
    }
}
