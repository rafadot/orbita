import { toObservable } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { SessaoService } from './sessao.service';

/** Bloqueia `/login`/`/cadastro` para quem já está autenticado — manda para `/home`. */
export const anonimoGuard: CanActivateFn = () => {
  const sessaoService = inject(SessaoService);
  const router = inject(Router);

  return toObservable(sessaoService.estado).pipe(
    filter((estadoSessao) => estadoSessao !== 'carregando'),
    take(1),
    map((estadoSessao) =>
      estadoSessao === 'autenticado' ? router.createUrlTree(['/home']) : true,
    ),
  );
};
