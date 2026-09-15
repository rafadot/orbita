import { Routes } from '@angular/router';

export const homeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/inicio/inicio').then((modulo) => modulo.Inicio),
  },
];
