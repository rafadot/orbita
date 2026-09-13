import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const TAMANHO_MINIMO = 10;
const TAMANHO_SENHA_FORTE = 14;

/**
 * Replica `SenhaForteValidator` da API (ver `auth/CLAUDE.md` e
 * `api-auth.md`): mínimo 10 caracteres, ao menos uma maiúscula OU dígito, e
 * ao menos um símbolo (qualquer caractere que não seja letra nem dígito).
 */
export function senhaForte(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    atendeRegrasSenhaForte((control.value as string | null) ?? '') ? null : { senhaFraca: true };
}

export function atendeRegrasSenhaForte(senha: string): boolean {
  return atendeTamanhoMinimo(senha) && atendeMaiusculaOuDigito(senha) && atendeSimbolo(senha);
}

export function atendeTamanhoMinimo(senha: string): boolean {
  return senha.length >= TAMANHO_MINIMO;
}

export function atendeMaiusculaOuDigito(senha: string): boolean {
  return /[A-Z0-9]/.test(senha);
}

export function atendeSimbolo(senha: string): boolean {
  return [...senha].some((caractere) => !/[\p{L}\p{N}]/u.test(caractere));
}

export interface ForcaSenha {
  nivel: 1 | 2 | 3 | 4;
  rotulo: string;
  dica?: string;
}

/** Nível 1-2 = ainda não atende a API; 3-4 = atende (4 = também tem bastante margem). */
export function calcularForcaSenha(senha: string): ForcaSenha {
  if (!atendeTamanhoMinimo(senha)) {
    return { nivel: 1, rotulo: 'fraca', dica: 'Use pelo menos 10 caracteres.' };
  }
  if (!atendeMaiusculaOuDigito(senha)) {
    return { nivel: 2, rotulo: 'razoável', dica: 'Inclua uma letra maiúscula ou um número.' };
  }
  if (!atendeSimbolo(senha)) {
    return { nivel: 2, rotulo: 'razoável', dica: 'Adicione um símbolo para ficar forte.' };
  }
  if (senha.length < TAMANHO_SENHA_FORTE) {
    return { nivel: 3, rotulo: 'boa' };
  }
  return { nivel: 4, rotulo: 'forte' };
}
