import { HttpInterceptorFn } from '@angular/common/http';
import { obterTokenAcesso } from '../auth/armazenamento-sessao';
import { environment } from '../../../environments/environment';

/**
 * Anexa `Authorization: Bearer` nas chamadas à própria API, quando há token
 * guardado. Fica de fora de `/auth/**` (todos `permitAll` na API, nenhum
 * usa Bearer — logout manda o refresh no corpo): um token de acesso velho
 * ou inválido guardado do lado do front faria o resource server do Spring
 * rejeitar a requisição com `401` vazio *antes* de chegar ao controller,
 * mascarando o `problem+json` real (ex.: "E-mail ou senha incorretos." no
 * login) com "Sua sessão expirou." (ver `erroApiInterceptor`).
 */
export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenAcesso = obterTokenAcesso();
  if (
    !tokenAcesso ||
    !request.url.startsWith(environment.apiUrl) ||
    request.url.includes('/auth/')
  ) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${tokenAcesso}` } }));
};
