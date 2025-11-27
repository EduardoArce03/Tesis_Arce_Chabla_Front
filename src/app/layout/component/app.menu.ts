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
                label: '🎮 Juegos Culturales',
                items: [
                    {
                        label: 'Misiones',
                        icon: 'pi pi-book',
                        routerLink: '/juegos/misiones' // ✅ Correcto
                    },
                    {
                        label: 'Exploración Ingapirca',
                        icon: 'pi pi-map',
                        routerLink: '/juegos/exploracion' // ✅ Correcto
                    },
                    {
                        label: 'Memoria Cultural',
                        icon: 'pi pi-th-large',
                        routerLink: '/juegos/memoria' // ✅ Correcto
                    }
                ]
            },
            {
                separator: true
            },
            {
                label: '📊 Panel de Control',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-home',
                        routerLink: '/'
                    }
                ]
            }
        ];
    }
}
