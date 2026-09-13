import { FormControl } from '@angular/forms';
import { atendeRegrasSenhaForte, calcularForcaSenha, senhaForte } from './senha-forte';

describe('senhaForte', () => {
  it('deve invalidar quando a senha tem menos de 10 caracteres', () => {
    const controle = new FormControl('Ab1!', senhaForte());

    expect(controle.errors).toEqual({ senhaFraca: true });
  });

  it('deve invalidar quando falta maiuscula e digito', () => {
    const controle = new FormControl('senha-fraca!', senhaForte());

    expect(controle.errors).toEqual({ senhaFraca: true });
  });

  it('deve invalidar quando falta simbolo', () => {
    const controle = new FormControl('SenhaForte10', senhaForte());

    expect(controle.errors).toEqual({ senhaFraca: true });
  });

  it('deve validar quando atende tamanho, maiuscula ou digito, e simbolo', () => {
    const controle = new FormControl('Senha#Forte10', senhaForte());

    expect(controle.errors).toBeNull();
  });

  it('deve validar com apenas digito e simbolo, sem maiuscula', () => {
    expect(atendeRegrasSenhaForte('numero12345!')).toBe(true);
  });
});

describe('calcularForcaSenha', () => {
  it('deve retornar nivel 1 quando a senha e curta', () => {
    expect(calcularForcaSenha('curta')).toEqual({
      nivel: 1,
      rotulo: 'fraca',
      dica: 'Use pelo menos 10 caracteres.',
    });
  });

  it('deve retornar nivel 2 quando falta maiuscula ou digito', () => {
    const forca = calcularForcaSenha('senha-comprida!');

    expect(forca.nivel).toBe(2);
    expect(forca.dica).toBe('Inclua uma letra maiúscula ou um número.');
  });

  it('deve retornar nivel 2 quando falta simbolo', () => {
    const forca = calcularForcaSenha('SenhaForte10');

    expect(forca.nivel).toBe(2);
    expect(forca.dica).toBe('Adicione um símbolo para ficar forte.');
  });

  it('deve retornar nivel 3 quando atende as regras mas tem menos de 14 caracteres', () => {
    const forca = calcularForcaSenha('Senha#Forte10');

    expect(forca).toEqual({ nivel: 3, rotulo: 'boa' });
  });

  it('deve retornar nivel 4 quando atende as regras e tem 14 ou mais caracteres', () => {
    const forca = calcularForcaSenha('Senha#BemForte100');

    expect(forca).toEqual({ nivel: 4, rotulo: 'forte' });
  });
});
