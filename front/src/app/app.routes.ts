import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/painel' },
  { path: '', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes) },
  {
    path: 'painel',
    loadChildren: () => import('./features/painel/painel.routes').then((m) => m.painelRoutes),
  },
  { path: '**', redirectTo: '/painel' },
];
