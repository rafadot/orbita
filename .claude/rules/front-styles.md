---
paths:
  - "front/src/**/*.scss"
---

# Estilos (SCSS)

- Budget de 4kB por estilo de componente (já configurado em
  `angular.json` → `anyComponentStyle`) — evitar CSS duplicado, extrair
  padrão repetido para `styles.scss` global ou mixin compartilhado.
- Tokens visuais (cor, espaçamento, tipografia, raio, tema claro/escuro)
  vivem em `src/styles/_tokens.scss`, forwarded por `src/styles.scss`
  (`@forward 'styles/tokens'`) — nunca cor hardcoded num componente.
  Portado verbatim do protótipo Claude Design (ver
  [`../../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md`](../../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md)),
  não reinterpretar valores aqui — ressincronizar do protótipo se ele mudar.
  Custom properties usam o prefixo `--dl-*` (namespace técnico herdado do
  protótipo, sem relação com a marca atual "Órbita" — não renomear).
- `stylePreprocessorOptions.includePaths` (`angular.json`) inclui
  `src/styles`, então um componente pode `@use 'tokens' as tokens;` e
  chamar `@include tokens.button-primary;`, `tokens.color(accent)` etc.
  Mixins disponíveis: `input-base`, `field-label`/`field-hint`/`field-error`,
  `button-base`/`button-primary`/`button-secondary`/`button-ghost`,
  `alert-base`, `otp-input`, `password-strength`, `auth-shell`. Usar esses
  mixins em vez de recriar o estilo — é isso que mantém as telas fiéis ao
  protótipo.
- Nunca usar `::ng-deep` — se precisar estilizar filho, expor via `::part()`
  ou reestruturar o componente.
