import { Routes } from '@angular/router';
import { autenticadoGuard } from './core/auth/autenticado.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes) },
  {
    path: '',
    loadComponent: () => import('./shared/layout/shell/shell').then((m) => m.Shell),
    canActivate: [autenticadoGuard],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '/home' },
];
