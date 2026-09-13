/** Corpo de `POST /auth/login` e `POST /auth/renovar` — ver `api/CLAUDE.md`. */
export interface TokensResponse {
  tokenAcesso: string;
  tipoToken: string;
  expiraEm: number;
  tokenAtualizacao: string;
}
