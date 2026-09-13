import { Routes } from '@angular/router';
import { autenticadoGuard } from '../../core/auth/autenticado.guard';

export const painelRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inicio/inicio').then((modulo) => modulo.Inicio),
    canActivate: [autenticadoGuard],
  },
];
