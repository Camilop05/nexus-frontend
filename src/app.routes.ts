import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    
    path: '',
    component: AppLayout,

    // Protege todas las rutas hijas del layout principal.
    canActivateChild: [authGuard],
    children: [
      // Dashboard de Sakai.
      {
        path: 'profile',
        loadComponent: () => import('./app/pages/profile/profile').then((m) => m.ProfilePage),
      },
      {
        path: '',
        component: Dashboard,
      },

      // Nueva pantalla conectada a NestJS.
      {
        path: 'users',
        loadComponent: () => import('./app/pages/users/users').then((m) => m.UsersPage),
      },

      // Zonas de acceso y bitácora de seguridad.
      {
        path: 'access-zones',
        loadComponent: () =>
          import('./app/pages/access-zones/access-zones').then((m) => m.AccessZonesPage),
      },
      {
        path: 'access-log',
        loadComponent: () => import('./app/pages/access-log/access-log').then((m) => m.AccessLogPage),
      },

      // Rutas demo de Sakai. Puedes conservarlas para clase.
      {
        path: 'uikit',
        loadChildren: () => import('./app/pages/uikit/uikit.routes'),
      },
      {
        path: 'documentation',
        component: Documentation,
      },
      {
        path: 'pages',
        loadChildren: () => import('./app/pages/pages.routes'),
      },
    ],
  },
  {
    path: 'landing',
    component: Landing,
  },
  {
    path: 'notfound',
    component: Notfound,
  },
  {
    path: 'auth',
    loadChildren: () => import('./app/pages/auth/auth.routes'),
  },
  {
    path: '**',
    redirectTo: '/notfound',
  },
];