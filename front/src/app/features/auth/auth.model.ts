/** `POST /auth/login` — ver `api/CLAUDE.md`. */
export interface LoginRequest {
  email: string;
  senha: string;
  manterConectado: boolean;
}

/** `POST /auth/cadastro` — ver `api/CLAUDE.md`. */
export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  aceitouTermos: boolean;
}
