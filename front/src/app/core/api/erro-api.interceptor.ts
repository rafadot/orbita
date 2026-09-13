import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErroApi } from './erro-api.model';

const CAMPOS_PROBLEM_DETAIL = new Set(['type', 'title', 'status', 'detail', 'instance', 'erros']);

/**
 * Traduz toda resposta de erro em {@link ErroApi} antes de propagar —
 * nenhum componente lê `HttpErrorResponse` diretamente. Um 401 de rota
 * protegida (JWT ausente/expirado) não é `application/problem+json` — vem
 * do resource server do Spring Security com corpo vazio (ver
 * `api/CLAUDE.md`) — por isso não tenta parsear corpo nesse caso.
 */
export const erroApiInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(catchError((erro: unknown) => throwError(() => paraErroApi(erro))));

function paraErroApi(erro: unknown): ErroApi {
  if (!(erro instanceof HttpErrorResponse)) {
    return {
      status: 0,
      tipo: 'desconhecido',
      titulo: 'Erro inesperado',
      detalhe: 'Algo deu errado.',
    };
  }
  if (erro.status === 0) {
    return {
      status: 0,
      tipo: 'indisponivel',
      titulo: 'Sem conexão',
      detalhe: 'Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.',
    };
  }
  const corpo: unknown = erro.error;
  if (!ehProblemDetail(corpo)) {
    return {
      status: erro.status,
      tipo: erro.status === 401 ? 'nao-autenticado' : 'desconhecido',
      titulo: erro.status === 401 ? 'Não autenticado' : 'Erro inesperado',
      detalhe: erro.status === 401 ? 'Sua sessão expirou.' : 'Algo deu errado. Tente novamente.',
    };
  }
  const extensoes: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(corpo)) {
    if (!CAMPOS_PROBLEM_DETAIL.has(chave)) {
      extensoes[chave] = valor;
    }
  }
  return {
    status: erro.status,
    tipo: ultimoSegmento(corpo.type),
    titulo: corpo.title,
    detalhe: corpo.detail,
    erros: corpo.erros,
    extensoes,
  };
}

interface ProblemDetailBruto {
  type: string;
  title: string;
  detail: string;
  erros?: { campo: string; mensagem: string }[];
  [chave: string]: unknown;
}

function ehProblemDetail(corpo: unknown): corpo is ProblemDetailBruto {
  return (
    typeof corpo === 'object' &&
    corpo !== null &&
    typeof (corpo as Record<string, unknown>)['type'] === 'string' &&
    typeof (corpo as Record<string, unknown>)['detail'] === 'string'
  );
}

function ultimoSegmento(uri: string): string {
  return uri.slice(uri.lastIndexOf('/') + 1);
}
