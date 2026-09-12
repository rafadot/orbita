---
paths:
  - "front/src/**/*.scss"
---

# Estilos (SCSS)

- Budget de 4kB por estilo de componente (já configurado em
  `angular.json` → `anyComponentStyle`) — evitar CSS duplicado, extrair
  padrão repetido para `styles.scss` global ou mixin compartilhado.
- Tokens visuais (cor, espaçamento, tipografia) centralizados em
  `src/styles.scss`; nunca cor hardcoded num componente — isso é
  placeholder até o design system chegar (ver `front/CLAUDE.md` § UI — TODO).
- Nunca usar `::ng-deep` — se precisar estilizar filho, expor via `::part()`
  ou reestruturar o componente.
