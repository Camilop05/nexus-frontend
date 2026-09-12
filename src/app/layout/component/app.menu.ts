import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Inicio',
                items: [{ label: 'Panel de control', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Control de acceso',
                items: [
                    { label: 'Zonas de la estación', icon: 'pi pi-sitemap', routerLink: ['/access-zones'] },
                    { label: 'Bitácora', icon: 'pi pi-book', routerLink: ['/access-log'] },
                ]
            },
            {
                label: 'Administración',
                items: [
                    {
                        label: 'Usuarios',
                        icon: 'pi pi-users',
                        routerLink: ['/users'],
                    },
                ]
            },
        ];
    }
}