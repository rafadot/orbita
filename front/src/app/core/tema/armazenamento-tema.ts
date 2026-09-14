import { Tema } from './tema.model';

const CHAVE = 'orbita-theme';

/**
 * Tema escolhido pelo usuário, sobrevive a reload. `localStorage` (não
 * `sessionStorage`: preferência de UI, não sessão) — leitura/escrita em
 * `try/catch` porque o storage pode estar bloqueado (modo privado, política
 * do navegador), igual `core/auth/armazenamento-sessao.ts`.
 */
export function guardarTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    /* localStorage indisponível — tema simplesmente não persiste */
  }
}

export function lerTemaSalvo(): Tema | null {
  try {
    const valor = localStorage.getItem(CHAVE);
    return valor === 'light' || valor === 'dark' ? valor : null;
  } catch {
    return null;
  }
}
