<!--
  Este arquivo carrega em TODA sessão — manter < 80 linhas. Regra de ouro:
  ponteiro, não cópia — específico de módulo vai pra api/CLAUDE.md ou
  front/CLAUDE.md; subtema vai pra .claude/rules/*.md; decisão com
  justificativa longa vira ADR em docs/adr/. Nunca `@import` aqui — carrega
  tudo no launch, anula o ganho de manter os filhos pequenos.
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
  - [`api/.../core/CLAUDE.md`](api/src/main/java/com/dot/api/orbita/core/CLAUDE.md) — núcleo (security, error, mail, config)
  - [`api/.../auth/CLAUDE.md`](api/src/main/java/com/dot/api/orbita/auth/CLAUDE.md) — cadastro/autenticação: contrato HTTP + regras
- [`front/CLAUDE.md`](front/CLAUDE.md) — convenções do front; carrega ao ler algo em `front/`
- [`.claude/rules/api-codigo.md`](.claude/rules/api-codigo.md) — estilo Java (nomes, comentários, entidade/service); ao tocar `api/src/main/java/**`
- [`.claude/rules/api-config.md`](.claude/rules/api-config.md) — properties/profile local; ao tocar `application*.properties`, `compose.yaml`, `core/config`
- [`.claude/rules/api-erros.md`](.claude/rules/api-erros.md) — `GlobalExceptionHandler`/`messages.properties`; ao tocar `core/error/**`
- [`.claude/rules/api-migrations.md`](.claude/rules/api-migrations.md) — ao tocar `api/src/main/resources/db/**`
- [`.claude/rules/api-tests.md`](.claude/rules/api-tests.md) — ao tocar `api/src/test/**`
- [`.claude/rules/api-auth.md`](.claude/rules/api-auth.md) — ao tocar `api/src/main/java/**/auth/**`
- [`.claude/rules/front-components.md`](.claude/rules/front-components.md) / [`front-styles.md`](.claude/rules/front-styles.md) / [`front-http.md`](.claude/rules/front-http.md) — componentes Angular / `.scss` / sessão+HTTP (`core/api`, `core/auth`, `environments`)
- [`docs/adr/`](docs/adr/README.md) — decisões e o porquê; ler quando precisar entender a razão por trás de uma convenção, não por padrão

## Comandos essenciais

```bash
# api/  (exige application-local.properties preenchido — ver api-config.md)
./mvnw spring-boot:run -Dspring-boot.run.profiles=local   # sobe a API local + Mailpit
./mvnw verify               # testes unitários + gate JaCoCo 80% (ver api-tests.md)

# front/
npm start                   # dev server
npm test                    # Vitest
npm run build                # build de produção
```

## Regras transversais

- Todo dado de domínio pertence a um usuário autenticado; nunca expor,
  listar ou agregar dado sem filtrar pelo usuário da requisição.
- Módulo novo = pacote novo na API **e** feature nova no front, mesmo nome
  (`financas` ↔ `features/financas`).
- Integração externa nunca vaza tipo do provedor para o domínio — sempre
  mapeada em `orbita/integration/<provedor>` (API) ou `core/` (front).
- Contrato HTTP api↔front: JSON camelCase, datas ISO-8601, erros
  `application/problem+json` em pt-BR (ADR 0008).
- Nunca alterar path/contrato de um endpoint existente — criar um novo e
  depreciar o antigo.
- Antes de dar uma tarefa por concluída, compilar/testar o lado tocado.

## Como manter este contexto

Aprendizado novo? Ele tem um lugar: transversal → aqui; de um módulo →
`api/CLAUDE.md`/`front/CLAUDE.md`; de um subtema → `.claude/rules/`;
procedimento repetível → skill; preferência do usuário → memória de sessão.
Ao fim de tarefas relevantes, use a skill `consolidar-contexto`.
