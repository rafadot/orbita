---
paths:
  - "front/src/app/**/*.ts"
  - "front/src/app/**/*.html"
---

# Componentes Angular

- `ChangeDetectionStrategy.OnPush` sempre.
- Sem lógica no template além de bindings simples e `@if`/`@for` — lógica
  vai no componente/serviço.
- `@for` sempre com `track` explícito (nunca `track $index` se houver id
  estável disponível).
- Fetch de dados via `resource()`/`httpResource()`, não `ngOnInit` +
  subscribe manual.
- `input()`/`output()`/`model()` em vez de `@Input()`/`@Output()`.
- `inject()` em vez de injeção via construtor.
- Acessibilidade mínima: todo elemento clicável interativo tem `role`/`type`
  correto e é alcançável por teclado.
