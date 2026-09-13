# 0007 — Documentação OpenAPI via springdoc, só em ambiente local

## Contexto

O contrato HTTP do módulo `auth` (7 endpoints) só existia em prosa na
tabela de `auth/CLAUDE.md` e no código dos controllers — sem um jeito
navegável de explorar ou testar os endpoints manualmente, e sem fonte
única quando o front começar a consumir a API.

## Decisão

`springdoc-openapi-starter-webmvc-ui` versão `3.1.1` — a série `3.x` é a
compatível com Spring Boot 4/Jakarta EE (`2.x` depende de Jackson 2, que
colide com o Jackson 3 do Boot 4). Documentação rica: `@Tag`/`@Operation`/
`@ApiResponses` em cada endpoint (espelhando a tabela do `CLAUDE.md` do
módulo, erros de domínio incluídos) e `@Schema` nos DTOs. Um
`OpenApiCustomizer` central (`core/config/OpenApiConfig`) registra o
schema de `ProblemDetail` e o aplica automaticamente a toda resposta de
erro documentada sem `@Content` explícito — evita repetir esse par em
cada `@ApiResponse`. Exposição (`springdoc.api-docs.enabled` /
`springdoc.swagger-ui.enabled`) é `false` na base e só `true` em
`application-local.properties`: uma API pessoal não ganha nada expondo o
contrato publicamente em prod, e a base já é prod-ready (ADR 0006).
`SecurityConfig` libera `/v3/api-docs/**` e `/swagger-ui/**` — sem efeito
fora de local, porque o springdoc desligado responde 404 antes de chegar
no filtro.

## Consequências

- Endpoint novo nasce com `@Operation` + `@ApiResponses`; não é opcional
  (regra em `api-codigo.md`).
- Handler de erro novo (`GlobalExceptionHandler`) continua sendo a fonte
  de verdade do formato; o customizer só evita repetição de schema, não
  substitui a tabela de erros de cada `CLAUDE.md` de módulo.
- `auth/CLAUDE.md` e as anotações podem divergir com o tempo — mudar um
  contrato exige mudar os dois.
- Fora de escopo por ora: gerar client TypeScript pro front a partir de
  `/v3/api-docs.yaml`, versionamento de API, grupos de documentação por
  módulo (`springdoc.group-configs`) — revisitar quando houver mais de um
  módulo com endpoints públicos.
