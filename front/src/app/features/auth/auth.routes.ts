import { Routes } from '@angular/router';
import { anonimoGuard } from '../../core/auth/anonimo.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((modulo) => modulo.Login),
    canActivate: [anonimoGuard],
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro').then((modulo) => modulo.Cadastro),
    canActivate: [anonimoGuard],
  },
  {
    path: 'confirmar-email',
    loadComponent: () =>
      import('./pages/confirmar-email/confirmar-email').then((modulo) => modulo.ConfirmarEmail),
  },
];
