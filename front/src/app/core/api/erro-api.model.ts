/** Um item de `erros[]` num `400` de validação — `{campo, mensagem}`. */
export interface ErroDeCampo {
  campo: string;
  mensagem: string;
}

/**
 * Forma normalizada de qualquer erro HTTP da API, a partir do
 * `application/problem+json` (RFC 9457) descrito em `api/CLAUDE.md`, ou de
 * um caso sem corpo (401 do resource server, falha de rede).
 */
export interface ErroApi {
  status: number;
  /** Slug do `type` (ex.: `credenciais-invalidas`), sem o prefixo de URI. */
  tipo: string;
  titulo: string;
  detalhe: string;
  erros?: ErroDeCampo[];
  /** Extensões do ProblemDetail fora de `erros` (ex.: `tentativasRestantes`, `bloqueadoAte`). */
  extensoes?: Record<string, unknown>;
}
