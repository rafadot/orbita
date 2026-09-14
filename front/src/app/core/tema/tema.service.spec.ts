import { TestBed } from '@angular/core/testing';
import { TemaService } from './tema.service';

function stubMatchMedia(correspondencias: Record<string, boolean>): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: correspondencias[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

const CONSULTA_DARK = '(prefers-color-scheme: dark)';
const CONSULTA_REDUZIDO = '(prefers-reduced-motion: reduce)';

describe('TemaService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    delete document.documentElement.dataset['temaOnda'];
    stubMatchMedia({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    localStorage.clear();
  });

  function criarServico(): TemaService {
    TestBed.configureTestingModule({});
    return TestBed.inject(TemaService);
  }

  it('le o tema salvo no localStorage', () => {
    localStorage.setItem('orbita-theme', 'dark');

    const servico = criarServico();

    expect(servico.tema()).toBe('dark');
  });

  it('sem valor salvo usa prefers-color-scheme', () => {
    stubMatchMedia({ [CONSULTA_DARK]: true });

    const servico = criarServico();

    expect(servico.tema()).toBe('dark');
  });

  it('mantem <html data-theme> sincronizado com o tema atual', () => {
    localStorage.setItem('orbita-theme', 'dark');

    const servico = criarServico();
    TestBed.tick();

    expect(document.documentElement.dataset['theme']).toBe(servico.tema());
  });

  it('com reduced-motion troca o tema na hora, sem onda', () => {
    localStorage.setItem('orbita-theme', 'light');
    stubMatchMedia({ [CONSULTA_REDUZIDO]: true });

    const servico = criarServico();
    servico.alternarTema(10, 10);
    TestBed.tick();

    expect(servico.tema()).toBe('dark');
    expect(servico.onda()).toBeNull();
    expect(localStorage.getItem('orbita-theme')).toBe('dark');
  });

  it('expandir (escuro->claro) comita o tema em 46% da duracao e remove a onda ao fim', () => {
    vi.useFakeTimers();
    localStorage.setItem('orbita-theme', 'dark');

    const servico = criarServico();
    servico.alternarTema(10, 10);
    TestBed.tick();

    expect(servico.onda()?.direcao).toBe('expandir');
    expect(servico.tema()).toBe('dark');

    vi.advanceTimersByTime(850 * 0.46 - 1);
    expect(servico.tema()).toBe('dark');

    vi.advanceTimersByTime(2);
    expect(servico.tema()).toBe('light');
    expect(servico.onda()).not.toBeNull();

    vi.advanceTimersByTime(850 + 120);
    expect(servico.onda()).toBeNull();
  });

  it('recolher (claro->escuro) comita o tema na hora e remove a onda ao fim', () => {
    vi.useFakeTimers();
    localStorage.setItem('orbita-theme', 'light');

    const servico = criarServico();
    servico.alternarTema(10, 10);
    TestBed.tick();

    expect(servico.onda()?.direcao).toBe('recolher');
    expect(servico.onda()?.temaDisco).toBe('light');
    expect(servico.tema()).toBe('dark');

    vi.advanceTimersByTime(850 + 119);
    expect(servico.onda()).not.toBeNull();

    vi.advanceTimersByTime(2);
    expect(servico.onda()).toBeNull();
  });

  it('ignora um novo clique enquanto a onda anterior ainda esta em andamento', () => {
    vi.useFakeTimers();
    localStorage.setItem('orbita-theme', 'light');

    const servico = criarServico();
    servico.alternarTema(10, 10);
    TestBed.tick();
    const primeiraOnda = servico.onda();

    servico.alternarTema(500, 500);
    TestBed.tick();

    expect(servico.onda()).toBe(primeiraOnda);

    vi.advanceTimersByTime(850 + 120);
    expect(servico.tema()).toBe('dark');
    expect(servico.onda()).toBeNull();
  });
});
