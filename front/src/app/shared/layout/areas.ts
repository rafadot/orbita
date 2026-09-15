/**
 * As oito áreas de vida do Órbita — usadas na navegação do `Shell` e no
 * bloco "As oito áreas do Órbita" da tela de primeiro acesso. Nenhuma tem
 * rota própria ainda (ver `.claude/rules` — módulo novo = pacote na API +
 * feature no front, mesmo nome); por ora só identificam a área na UI.
 */
export interface Area {
  readonly sigla: string;
  readonly rotulo: string;
}

export const AREAS: readonly Area[] = [
  { sigla: 'Fi', rotulo: 'Finanças' },
  { sigla: 'Sa', rotulo: 'Saúde' },
  { sigla: 'Ag', rotulo: 'Agenda' },
  { sigla: 'Me', rotulo: 'Metas' },
  { sigla: 'Há', rotulo: 'Hábitos' },
  { sigla: 'Ta', rotulo: 'Tarefas' },
  { sigla: 'Do', rotulo: 'Documentos' },
  { sigla: 'Ca', rotulo: 'Carreira' },
];
