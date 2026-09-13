# ADRs — Orbita

Registro de decisões de arquitetura com a justificativa por trás. CLAUDE.md
nunca copia este conteúdo — só aponta para cá. Ler quando precisar entender
**por que** uma convenção existe, não como referência de todo dia.

## Template

```markdown
# NNNN — Título curto

## Contexto
O que motivou a decisão (≤ 5 linhas).

## Decisão
O que foi decidido (≤ 5 linhas).

## Consequências
O que isso implica na prática, incluindo trade-offs aceitos (≤ 10 linhas).
```

## Índice

- [0001 — Multiusuário desde o dia 1](0001-multiusuario-desde-o-dia-1.md)
- [0002 — JWT stateless sem lib externa](0002-jwt-stateless-sem-lib-externa.md)
- [0003 — Angular signals + zoneless, sem store](0003-angular-signals-zoneless-sem-store.md)
- [0004 — Protótipo de autenticação (Claude Design) como fonte de verdade](0004-prototipo-autenticacao-fonte-de-verdade.md)
- [0005 — Refresh token opaco com rotação, guardado hasheado](0005-refresh-token-opaco-com-rotacao.md)
- [0006 — Config: base prod-ready + `application-local.properties` gitignored](0006-config-base-mais-application-local.md)
- [0007 — Documentação OpenAPI via springdoc, só em ambiente local](0007-openapi-via-springdoc.md)
- [0008 — Erros HTTP sempre em pt-BR, validação com lista de campos](0008-erros-http-em-pt-br-com-lista-de-campos.md)
