const CHAVE = 'orbita.emailPendente';

/**
 * E-mail que aguarda confirmação — nunca uma credencial, só usado para
 * mostrar "Enviamos um link para {email}" na tela de confirmação sem exigir
 * que o usuário digite de novo. `sessionStorage` (some ao fechar a aba, não
 * é sincronizado entre abas) é suficiente; falha silenciosamente se
 * indisponível (modo privado, por exemplo).
 */
export function definirEmailPendente(email: string): void {
  try {
    sessionStorage.setItem(CHAVE, email);
  } catch {
    /* sessionStorage indisponível — degrada para o fluxo sem e-mail memorizado */
  }
}

export function obterEmailPendente(): string | null {
  try {
    return sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function limparEmailPendente(): void {
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    /* nada a limpar */
  }
}
