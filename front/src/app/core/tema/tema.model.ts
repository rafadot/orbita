import { InjectionToken } from '@angular/core';

export type Tema = 'light' | 'dark';

/**
 * Estado da onda de transição em andamento. `direcao` decide a geometria
 * (expandir cresce do ícone; recolher encolhe até o ícone). `temaDisco` é o
 * tema que pinta o fundo do disco — o destino ao expandir, a origem ao
 * recolher (protótipo: o disco mostra o tema que está saindo de cena).
 * `temaDestino` é sempre o tema pro qual a troca está indo — usado só pro
 * acento do halo (`TemaService.alternarTema`).
 */
export interface OndaTema {
  direcao: 'expandir' | 'recolher';
  x: number;
  y: number;
  raio: number;
  temaDisco: Tema;
  temaDestino: Tema;
}

export interface ConfiguracaoTema {
  duracaoOndaMs: number;
  temaInicial?: Tema;
  /** Sobrescreve `--dl-accent` do tema claro só no botão/onda — sem informar, usa o token. */
  acentoClaro?: string;
  /** Sobrescreve `--dl-accent` do tema escuro só no botão/onda — sem informar, usa o token. */
  acentoEscuro?: string;
}

const DURACAO_MINIMA_MS = 400;
const DURACAO_MAXIMA_MS = 1600;
const DURACAO_PADRAO_MS = 850;

export const CONFIGURACAO_TEMA = new InjectionToken<ConfiguracaoTema>('CONFIGURACAO_TEMA', {
  factory: () => ({ duracaoOndaMs: DURACAO_PADRAO_MS }),
});

/** Registra uma configuração customizada (`app.config.ts`); sem chamada, usa os defaults. */
export function provideTema(configuracao: Partial<ConfiguracaoTema>) {
  const duracaoOndaMs = clampDuracao(configuracao.duracaoOndaMs ?? DURACAO_PADRAO_MS);
  return {
    provide: CONFIGURACAO_TEMA,
    useValue: { ...configuracao, duracaoOndaMs },
  };
}

function clampDuracao(duracaoMs: number): number {
  return Math.min(Math.max(duracaoMs, DURACAO_MINIMA_MS), DURACAO_MAXIMA_MS);
}
