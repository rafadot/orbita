/** Saudação e formatação de data do cabeçalho do `Shell` — funções puras pra testar sem TestBed. */

export function saudacaoPorHora(data: Date): string {
  const hora = data.getHours();
  if (hora < 5) return 'Boa noite';
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function removerPonto(texto: string): string {
  return texto.replace(/\.$/, '');
}

/** Ex.: "Quinta, 13 de setembro" — usado no cabeçalho desktop. */
export function formatarDataLonga(data: Date): string {
  const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
    .format(data)
    .replace(/-feira$/, '');
  const diaEMes = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(data);
  return `${capitalizar(diaSemana)}, ${diaEMes}`;
}

/** Ex.: "Qui, 13 set" — usado no cabeçalho mobile, mais compacto. */
export function formatarDataCurta(data: Date): string {
  const diaSemana = capitalizar(removerPonto(
    new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(data),
  ));
  const dia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(data);
  const mes = removerPonto(new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data));
  return `${diaSemana}, ${dia} ${mes}`;
}
