<!--
  Este arquivo é carregado em TODA sessão. Mantenha < 80 linhas.
  Regra de ouro: ponteiro, não cópia — o que é específico de um módulo vive em
  api/CLAUDE.md ou front/CLAUDE.md; o que é específico de um subtema vive em
  .claude/rules/*.md; decisões com justificativa longa viram ADR em docs/adr/.
  Nunca usar `@import` aqui — imports carregam tudo no launch, o que anula o
  ganho de manter os arquivos filhos pequenos.
-->

# Orbita

## Visão geral

Orbita é um app pessoal para gerenciar a vida do Rafael — modular, com várias
integrações externas, pensado desde o início para **escalar** (uso próprio →
amigos → possível produto). Cada módulo de vida (finanças, saúde, agenda...)
é uma feature isolada com fronteira clara, orbitando um núcleo comum.

Consequência prática: **multi-usuário é regra desde o dia 1**, não feature
futura — nenhum dado de domínio existe sem dono, nenhuma query roda sem
filtrar pelo usuário autenticado.

## Mapa

| Diretório | O que é |
|---|---|
| `api/` | Backend — Spring Boot 4 / Java 25 / Postgres |
| `front/` | Frontend — Angular 22, standalone, zoneless |
| `docs/adr/` | Decisões de arquitetura com justificativa (Architecture Decision Records) |
| `.claude/rules/` | Convenções carregadas só quando o arquivo tocado casa com o glob |

## Índice de contexto

- [`api/CLAUDE.md`](api/CLAUDE.md) — convenções da API; carrega ao ler algo em `api/`
- [`front/CLAUDE.md`](front/CLAUDE.md) — convenções do front; carrega ao ler algo em `front/`
- [`.claude/rules/api-migrations.md`](.claude/rules/api-migrations.md) — ao tocar `api/src/main/resources/db/**`
- [`.claude/rules/api-tests.md`](.claude/rules/api-tests.md) — ao tocar `api/src/test/**`
- [`.claude/rules/front-components.md`](.claude/rules/front-components.md) — ao tocar componentes Angular
- [`.claude/rules/front-styles.md`](.claude/rules/front-styles.md) — ao tocar `.scss`
- [`docs/adr/`](docs/adr/README.md) — decisões e o porquê; ler quando precisar entender a razão por trás de uma convenção, não por padrão

## Comandos essenciais

```bash
# api/
./mvnw spring-boot:run     # sobe a API local
./mvnw test                 # testes (Testcontainers, ver api-tests.md)

# front/
npm start                   # dev server
npm test                    # Vitest
npm run build                # build de produção
```

Detalhes de cada comando: ver o CLAUDE.md do módulo correspondente.

## Regras transversais

- Todo dado de domínio pertence a um usuário autenticado; nunca expor,
  listar ou agregar dado sem filtrar pelo usuário da requisição.
- Módulo novo = pacote novo na API **e** feature nova no front, mesmo nome
  (`financas` ↔ `features/financas`).
- Integração externa nunca vaza tipo do provedor para o domínio — sempre
  mapeada em `orbita/integration/<provedor>` (API) ou `core/` (front).
- Contrato HTTP api↔front: JSON camelCase, datas ISO-8601, erros
  `application/problem+json`.
- Nunca alterar path/contrato de um endpoint existente — criar um novo e
  depreciar o antigo.
- Antes de dar uma tarefa por concluída, compilar/testar o lado tocado.

## Como manter este contexto

Aprendizado novo? Ele tem um lugar: transversal → aqui; de um módulo →
`api/CLAUDE.md`/`front/CLAUDE.md`; de um subtema → `.claude/rules/`;
procedimento repetível → skill; preferência do usuário → memória de sessão.
Ao fim de tarefas relevantes, use a skill `consolidar-contexto`.
