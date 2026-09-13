/** `GET /me` — ver `api/CLAUDE.md`. */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  emailConfirmadoEm: string | null;
  criadoEm: string;
}
