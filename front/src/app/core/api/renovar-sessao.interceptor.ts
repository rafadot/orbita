import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { obterTokenAcesso, obterTokenAtualizacao } from '../auth/armazenamento-sessao';
import { SessaoService } from '../auth/sessao.service';

/**
 * Um 401 fora de `/auth/**` tenta renovar a sessão uma vez (via
 * `SessaoService.renovar`, que já compartilha a chamada entre requisições
 * concorrentes) e repete a requisição original; se não houver refresh
 * token guardado, nem tenta. `/auth/**` fica de fora — senão o próprio
 * `/auth/renovar` tentaria se renovar quando falhasse (responde `400`, não
 * `401`, mas o filtro evita qualquer ambiguidade).
 *
 * Só navega para `/login` quando a sessão **já estava** `autenticado` —
 * durante o bootstrap (`estado === 'carregando'`, chamado por
 * `SessaoService.restaurar()` no `provideAppInitializer`) um `navigate`
 * aqui corre com a navegação inicial do Router ainda não resolvida e a
 * cancela silenciosamente (`hasRequestedNavigation`), fazendo qualquer URL
 * aberta (ex.: `/confirmar-email?token=…`) cair em `/login` sem executar o
 * componente de destino. Precisa rodar mais perto do backend que
 * `tokenInterceptor`/`erroApiInterceptor` — a ordem em `withInterceptors`
 * importa (ver `app.config.ts`) — e por isso a requisição repetida precisa
 * ganhar o `Authorization` novo aqui mesmo: `next(request)` não passa de
 * novo por `tokenInterceptor`.
 */
export const renovarSessaoInterceptor: HttpInterceptorFn = (request, next) => {
  const sessaoService = inject(SessaoService);
  const router = inject(Router);

  if (request.url.includes('/auth/')) {
    return next(request);
  }

  return next(request).pipe(
    catchError((erro: unknown) => {
      if (!(erro instanceof HttpErrorResponse) || erro.status !== 401) {
        return throwError(() => erro);
      }
      if (!obterTokenAtualizacao()) {
        sessaoService.encerrarLocal();
        return throwError(() => erro);
      }
      const jaEstavaAutenticado = sessaoService.estado() === 'autenticado';
      return sessaoService.renovar().pipe(
        switchMap(() => {
          const tokenAcesso = obterTokenAcesso();
          const requisicaoRenovada = tokenAcesso
            ? request.clone({ setHeaders: { Authorization: `Bearer ${tokenAcesso}` } })
            : request;
          return next(requisicaoRenovada);
        }),
        catchError(() => {
          sessaoService.encerrarLocal();
          if (jaEstavaAutenticado) {
            router.navigate(['/login'], { queryParams: { retorno: router.url } });
          }
          return throwError(() => erro);
        }),
      );
    }),
  );
};
