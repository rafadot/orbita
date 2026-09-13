---
paths:
  - "api/src/main/resources/application*.properties"
  - "api/compose.yaml"
  - "api/src/main/java/**/core/config/**"
---

# Configuração da API — properties e ambiente

Decisão e motivo em [ADR 0006](../../docs/adr/0006-config-base-mais-application-local.md).

## Modelo (dois arquivos, não mais que isso)

| Arquivo | Papel | Git |
|---|---|---|
| `application.properties` | Base — vale pra qualquer ambiente, **inclusive prod**. Tudo que é pessoal/segredo vem de `${VAR}` **sem default nenhum**. | tracked |
| `application-local.properties` | Sobrescreve a base com valor real (DB, JWT, front) + o que só faz sentido local (Mailpit, `docker-compose`). | **gitignored** |

Ativar local: `./mvnw spring-boot:run -Dspring-boot.run.profiles=local`.
Sem profile, sobe só a base e falha se as env vars não existirem —
comportamento esperado.

## Não fazer (já foi tentado e rejeitado)

- **Não** criar `application-dev` / `application-prod` — a base já é a prod.
- **Não** pôr `spring.profiles.active` na base, nem com default `dev`/`local`.
- **Não** dar default a nenhuma `${VAR}` na base (`localhost:5434`,
  `http://localhost:4200`, etc.) — outro dev usa porta/banco/front diferentes.
- **Não** duplicar segredo entre `application-local.properties` e
  `CLAUDE.local.md` — mora só no properties.

## O que a base define hoje

`spring.datasource.*` (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`),
`ddl-auto=validate` (Flyway é dono do schema; `validate` só confere, não
altera), `open-in-view=false`, `spring.mvc.problemdetails.enabled=true`
(erros nativos do MVC também em RFC 9457), `spring.mvc.locale=pt-BR` +
`spring.mvc.locale-resolver=fixed` (mensagens de validação/erro sempre
pt-BR, não dependem do `Accept-Language` do cliente), `orbita.auth.*`
(`ORBITA_JWT_SECRET` + durações), `orbita.frontend-url`
(`ORBITA_FRONTEND_URL`), `springdoc.api-docs.enabled` /
`springdoc.swagger-ui.enabled=false` — documentação OpenAPI só em local
(ver [ADR 0007](../../docs/adr/0007-openapi-via-springdoc.md)), por isso
são `false`/`true` fixos, não `${VAR}`.

Durações em ISO-8601 (`PT15M` = 15 min, `P1D` = 1 dia; `M` depois de `T` é
minuto). Bindam em `java.time.Duration` nos records de `core/config`.

## `application-local.properties` — checklist do que é obrigatório

Se criar do zero: `spring.datasource.url/username/password`,
`orbita.auth.jwt-secret` (≥ 32 bytes), `orbita.frontend-url`,
`spring.docker.compose.enabled=true`, `spring.mail.host=localhost`,
`spring.mail.port=1025`, `spring.mail.properties.mail.smtp.auth=false`,
`spring.mail.properties.mail.smtp.starttls.enable=false`,
`springdoc.api-docs.enabled=true`, `springdoc.swagger-ui.enabled=true`.
Nova `${VAR}` na base ⇒ nova linha aqui.

## Records de config (`core/config`)

`AutenticacaoProperties` (`orbita.auth`) e `FrontendProperties` (`orbita`).
Nome de campo sem abreviação (ver `api-codigo.md`). Registrar todo record
novo em `@EnableConfigurationProperties` na `OrbitaApplication`.
