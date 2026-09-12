# 0003 — Angular signals + zoneless, sem store

## Contexto

Angular 22 já trata Signals e zoneless change detection como o caminho
recomendado, com `resource()`/`httpResource()` cobrindo o caso de dado
assíncrono que antes justificava um store (NgRx) só para cache/estado de
carregamento.

## Decisão

Estado local e de feature vive em signals dentro do serviço da própria
feature. `computed()` para derivados, `resource()`/`httpResource()` para
dados vindos da API. Nenhuma dependência de store global (NgRx ou similar)
introduzida por padrão.

## Consequências

- Menos boilerplate (sem actions/reducers/effects) para um app do porte do
  Orbita nesta fase.
- Zoneless exige disciplina: qualquer efeito colateral fora de signal/effect
  não dispara change detection automaticamente.
- Se um estado realmente precisar ser compartilhado entre features distantes
  (não só entre componentes de uma mesma feature), reavaliar — não é
  proibição permanente de store, é o padrão default.
