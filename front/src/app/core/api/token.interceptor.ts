import { HttpInterceptorFn } from '@angular/common/http';
import { obterTokenAcesso } from '../auth/armazenamento-sessao';
import { environment } from '../../../environments/environment';

/** Anexa `Authorization: Bearer` nas chamadas à própria API, quando há token guardado. */
export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenAcesso = obterTokenAcesso();
  if (!tokenAcesso || !request.url.startsWith(environment.apiUrl)) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${tokenAcesso}` } }));
};
