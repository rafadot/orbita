import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { lerTemaSalvo, guardarTema } from './armazenamento-tema';
import { CONFIGURACAO_TEMA, OndaTema, Tema } from './tema.model';

const ANTECEDENCIA_COMMIT_EXPANDIR = 0.46;
const FOLGA_REMOCAO_MS = 120;
const FATOR_RAIO = 1.06;

/**
 * Único dono do tema e da onda de transição. O overlay (`OndaTema`) só lê
 * `onda()` daqui — nenhuma tela decide cor ou timing. `tema()` é a fonte de
 * verdade aplicada em `<html data-theme>`; a onda é só a animação por cima.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly configuracao = inject(CONFIGURACAO_TEMA);
  private readonly destroyRef = inject(DestroyRef);

  readonly tema = signal<Tema>(this.temaInicial());
  readonly onda = signal<OndaTema | null>(null);
  readonly ondaEmAndamento = computed(() => this.onda() !== null);
  readonly duracaoOndaMs = this.configuracao.duracaoOndaMs;
  readonly acentoClaro = this.configuracao.acentoClaro;
  readonly acentoEscuro = this.configuracao.acentoEscuro;

  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    effect(() => {
      const tema = this.tema();
      document.documentElement.dataset['theme'] = tema;
      guardarTema(tema);
    });
    effect(() => {
      if (this.onda()) {
        document.documentElement.dataset['temaOnda'] = '';
      } else {
        delete document.documentElement.dataset['temaOnda'];
      }
    });
    this.destroyRef.onDestroy(() => this.limparTimers());
  }

  /** `origemX`/`origemY` são o centro do ícone que disparou a troca (`getBoundingClientRect`). */
  alternarTema(origemX: number, origemY: number): void {
    if (this.ondaEmAndamento()) {
      return;
    }

    const origem = this.tema();
    const destino: Tema = origem === 'dark' ? 'light' : 'dark';

    if (this.reducaoDeMovimentoAtiva()) {
      this.tema.set(destino);
      return;
    }

    const duracaoMs = this.configuracao.duracaoOndaMs;
    const raio = this.calcularRaio(origemX, origemY);

    if (destino === 'light') {
      this.expandir(origemX, origemY, raio, destino, duracaoMs);
    } else {
      this.recolher(origemX, origemY, raio, origem, destino, duracaoMs);
    }
  }

  /**
   * Escuro→claro: a onda cresce do ícone pintada com o tema destino (a cor
   * que ela "traz" por cima) e some com fade tardio; o tema real é comitado
   * a 46% da duração — a animação (CSS, `OndaTema`) roda sozinha a partir
   * das classes, sem precisar de `requestAnimationFrame` daqui.
   */
  private expandir(x: number, y: number, raio: number, destino: Tema, duracaoMs: number): void {
    this.onda.set({ direcao: 'expandir', x, y, raio, temaDisco: destino, temaDestino: destino });

    this.agendar(() => this.tema.set(destino), duracaoMs * ANTECEDENCIA_COMMIT_EXPANDIR);
    this.agendar(() => this.onda.set(null), duracaoMs + FOLGA_REMOCAO_MS);
  }

  /**
   * Claro→escuro: espelho exato da expansão. O tema real é comitado **na
   * hora** (mesmo tick que abre a onda — mesma renderização já mostra o
   * app no tema novo) e um disco pintado com o tema *antigo* encolhe por
   * cima até sumir no ícone, com o mesmo fade tardio.
   */
  private recolher(
    x: number,
    y: number,
    raio: number,
    origem: Tema,
    destino: Tema,
    duracaoMs: number,
  ): void {
    this.tema.set(destino);
    this.onda.set({ direcao: 'recolher', x, y, raio, temaDisco: origem, temaDestino: destino });

    this.agendar(() => this.onda.set(null), duracaoMs + FOLGA_REMOCAO_MS);
  }

  /** Acento configurado (`provideTema`) para um tema específico — `undefined` mantém o token padrão. */
  acentoPara(tema: Tema): string | undefined {
    return tema === 'dark' ? this.acentoEscuro : this.acentoClaro;
  }

  private calcularRaio(x: number, y: number): number {
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    const distancia = Math.hypot(Math.max(x, largura - x), Math.max(y, altura - y));
    return distancia * FATOR_RAIO;
  }

  private temaInicial(): Tema {
    return (
      this.configuracao.temaInicial ??
      lerTemaSalvo() ??
      (this.prefereEsquema('dark') ? 'dark' : 'light')
    );
  }

  private reducaoDeMovimentoAtiva(): boolean {
    return this.prefereEsquema('reduzido');
  }

  /**
   * `jsdom` (ambiente de teste) não implementa `matchMedia` — sem a checagem,
   * qualquer teste que crie `TemaService` (direto ou via `Logo`) quebra.
   * Navegador real sempre tem `matchMedia`, então o `false` aqui só é
   * alcançado em teste.
   */
  private prefereEsquema(consulta: 'dark' | 'reduzido'): boolean {
    if (typeof window.matchMedia !== 'function') {
      return false;
    }
    const media =
      consulta === 'dark' ? '(prefers-color-scheme: dark)' : '(prefers-reduced-motion: reduce)';
    return window.matchMedia(media).matches;
  }

  private agendar(acao: () => void, atrasoMs: number): void {
    const id = setTimeout(() => {
      this.timers.delete(id);
      acao();
    }, atrasoMs);
    this.timers.add(id);
  }

  private limparTimers(): void {
    for (const id of this.timers) {
      clearTimeout(id);
    }
    this.timers.clear();
  }
}
