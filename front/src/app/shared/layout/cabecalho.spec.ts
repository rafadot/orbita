import { formatarDataCurta, formatarDataLonga, saudacaoPorHora } from './cabecalho';

describe('saudacaoPorHora', () => {
  it('deve retornar Bom dia entre 5h e 11h59', () => {
    expect(saudacaoPorHora(new Date(2026, 8, 13, 8, 0))).toBe('Bom dia');
  });

  it('deve retornar Boa tarde entre 12h e 17h59', () => {
    expect(saudacaoPorHora(new Date(2026, 8, 13, 14, 0))).toBe('Boa tarde');
  });

  it('deve retornar Boa noite entre 18h e 4h59', () => {
    expect(saudacaoPorHora(new Date(2026, 8, 13, 20, 0))).toBe('Boa noite');
    expect(saudacaoPorHora(new Date(2026, 8, 13, 2, 0))).toBe('Boa noite');
  });
});

describe('formatarDataLonga', () => {
  it('deve formatar dia da semana com "-feira" removido e mês por extenso', () => {
    expect(formatarDataLonga(new Date(2026, 8, 17))).toBe('Quinta, 17 de setembro');
  });

  it('deve manter domingo e sábado sem sufixo pra remover', () => {
    expect(formatarDataLonga(new Date(2026, 8, 13))).toBe('Domingo, 13 de setembro');
  });
});

describe('formatarDataCurta', () => {
  it('deve formatar dia da semana e mês abreviados sem ponto', () => {
    expect(formatarDataCurta(new Date(2026, 8, 17))).toBe('Qui, 17 set');
  });
});
