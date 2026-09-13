import { toObservable } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { SessaoService } from './sessao.service';

/** Bloqueia rota autenticada enquanto anônimo — manda para `/login` com `retorno`. */
export const autenticadoGuard: CanActivateFn = (_rota, estado) => {
  const sessaoService = inject(SessaoService);
  const router = inject(Router);

  return toObservable(sessaoService.estado).pipe(
    filter((estadoSessao) => estadoSessao !== 'carregando'),
    take(1),
    map((estadoSessao) =>
      estadoSessao === 'autenticado'
        ? true
        : router.createUrlTree(['/login'], { queryParams: { retorno: estado.url } }),
    ),
  );
};
