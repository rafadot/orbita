import { TokensResponse } from './sessao.model';

const CHAVE_TOKEN_ACESSO = 'orbita.tokenAcesso';
const CHAVE_TOKEN_ATUALIZACAO = 'orbita.tokenAtualizacao';

/**
 * "Manter conectado" decide onde os tokens vivem: marcado vai pro
 * `localStorage` (sobrevive a fechar o navegador, refresh de 30 dias na
 * API); desmarcado vai pro `sessionStorage` (some ao fechar a aba, refresh
 * de 1 dia). Nunca em cookie — decisão revertida por complexidade (ver
 * memória do projeto). Leitura/escrita em `try/catch`: storage pode estar
 * bloqueado (modo privado, política do navegador).
 */
export function guardarTokens(tokens: TokensResponse, manterConectado: boolean): void {
  const destino = manterConectado ? localStorage : sessionStorage;
  const origem = manterConectado ? sessionStorage : localStorage;
  try {
    destino.setItem(CHAVE_TOKEN_ACESSO, tokens.tokenAcesso);
    destino.setItem(CHAVE_TOKEN_ATUALIZACAO, tokens.tokenAtualizacao);
    origem.removeItem(CHAVE_TOKEN_ACESSO);
    origem.removeItem(CHAVE_TOKEN_ATUALIZACAO);
  } catch {
    /* storage indisponível — sessão simplesmente não persiste */
  }
}

export function obterTokenAcesso(): string | null {
  return lerDeQualquerStorage(CHAVE_TOKEN_ACESSO);
}

export function obterTokenAtualizacao(): string | null {
  return lerDeQualquerStorage(CHAVE_TOKEN_ATUALIZACAO);
}

/** `true` se o token de acesso atual veio do `localStorage` ("manter conectado"). */
export function sessaoEhPersistente(): boolean {
  try {
    return localStorage.getItem(CHAVE_TOKEN_ACESSO) !== null;
  } catch {
    return false;
  }
}

export function limparTokens(): void {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      storage.removeItem(CHAVE_TOKEN_ACESSO);
      storage.removeItem(CHAVE_TOKEN_ATUALIZACAO);
    } catch {
      /* storage indisponível — nada a limpar */
    }
  }
}

function lerDeQualquerStorage(chave: string): string | null {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const valor = storage.getItem(chave);
      if (valor !== null) return valor;
    } catch {
      /* storage indisponível — tenta o próximo */
    }
  }
  return null;
}
