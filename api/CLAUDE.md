<!-- Carregado só quando Claude lê algo dentro de api/. Manter < 150 linhas. -->

# api/ — Backend Orbita

Ver visão geral e regras transversais em [`../CLAUDE.md`](../CLAUDE.md).

## Stack

Spring Boot 4.1.1, Java 25, PostgreSQL, Flyway, Spring Data JPA, Spring
Security (+ `oauth2-resource-server` para JWT), Lombok, Bean Validation,
Spring Mail, Argon2 (`bcprov-jdk18on`), JaCoCo. Módulo Maven único
(`com.dot.api.orbita`).

## Ambiente local

Dois arquivos: `application.properties` (base, prod-ready, só `${VAR}` sem
default) + `application-local.properties` (gitignored, valores reais +
Mailpit/docker-compose). Roda com profile `local`. Modelo completo e checklist
em [`api-config.md`](../.claude/rules/api-config.md) / ADR 0006. Mailpit:
`http://localhost:8025` (exige Docker).

## Comandos

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local  # local (sobe o Mailpit via compose.yaml)
./mvnw test                             # testes unitários (ver api-tests.md)
./mvnw verify                           # testes + gate de cobertura JaCoCo (80%)
./mvnw compile -DskipTests              # validação rápida de compilação
```

## Estrutura de pacotes

Por **módulo de domínio**, não por camada global:

```
com.dot.api.orbita/
├── core/               # ver core/CLAUDE.md — nunca importa módulo
│   ├── security/      # JWT, SecurityConfig, UsuarioAtual, GeradorToken
│   ├── config/        # records @ConfigurationProperties
│   ├── error/         # ExcecaoDominio, GlobalExceptionHandler
│   └── mail/          # EnviadorEmail (concreta), MensagemEmail
├── integration/
│   └── <provedor>/    # cliente externo isolado, nunca vaza tipo pro domínio
└── <modulo>/           # ex.: home, financas, saude...
    ├── api/            # Controller + DTOs (records)
    ├── service/
    ├── domain/         # entidades JPA
    └── repository/
```

Regra: um módulo nunca importa `service`/`repository` de outro módulo
diretamente — só através de um serviço exposto publicamente (interface em
`api` ou classe pública do módulo).

## Multi-usuário (regra de negócio central)

- Toda entidade de domínio tem `usuario_id NOT NULL` com índice. Exceção:
  `usuarios` — ela **é** o usuário, não referencia outro.
- `UsuarioAtual` (em `core/security`) é a única fonte do usuário autenticado
  — lê o `sub` do JWT validado, nunca confiar em id vindo do corpo/query.
- Repositórios expõem métodos que recebem o id do usuário explicitamente
  (`findByIdAndUsuarioId`, `findAllByUsuarioId`...) — nunca um `findById`
  cru usado direto num endpoint com id vindo do cliente. Excecão: buscar o
  próprio usuário autenticado por `UsuarioAtual.id()` é seguro, porque o id
  não vem de input do cliente (ver `AutenticacaoService.buscarUsuarioAtual`).

## Camadas

`Controller` (`@RestController`, só valida e traduz request/response) →
`Service` (`@Transactional` sempre aqui, nunca no controller) →
`Repository` (Spring Data JPA).

- Request/response são `record` — a entidade JPA nunca sai do controller.
- Construtor injection (Lombok `@RequiredArgsConstructor`), nunca `@Autowired` em campo.

## Erros

Um único `GlobalExceptionHandler` (`core/error`) traduz exceção de domínio
(`ExcecaoDominio` e subclasses) **e** nativa do Spring (validação, parse de
JSON...) pra `ProblemDetail` (RFC 9457), sempre em **pt-BR** — `title`
central por status, `detail` via `messages.properties` com locale fixo,
400 de validação com extensão `erros: [{campo, mensagem}]`. Nunca stack
trace cru. Mecanismo linha a linha: [`core/CLAUDE.md`](src/main/java/com/dot/api/orbita/core/CLAUDE.md).

## Segurança

JWT stateless via `spring-boot-starter-oauth2-resource-server` (sem lib
externa de JWT) — ver [`../docs/adr/0002-jwt-stateless-sem-lib-externa.md`](../docs/adr/0002-jwt-stateless-sem-lib-externa.md).
Refresh token é opaco, hasheado no banco e rotacionado a cada uso — ver
[`../docs/adr/0005-refresh-token-opaco-com-rotacao.md`](../docs/adr/0005-refresh-token-opaco-com-rotacao.md).
Único grupo de endpoints público: `/auth/**`. Sem sessão, sem CSRF — o
Sonar marca isso como hotspot de segurança (S4502); é esperado (API
stateless sem cookie de sessão, não há CSRF a proteger) e deve ser
revisado como "Safe" direto no SonarQube, não silenciado em código. CORS
liberado só pra origem de `orbita.frontend-url` — front e API rodam em
servidores diferentes (ver [ADR 0010](../docs/adr/0010-cors-front-api-servidores-diferentes.md)).

Módulo `auth` (cadastro, confirmação de e-mail, login, refresh, logout,
`GET /me`) documentado por completo em
[`auth/CLAUDE.md`](src/main/java/com/dot/api/orbita/auth/CLAUDE.md); fora
desta rodada: esqueci/redefinir senha, histórico de senha, 2FA, login
social (ver [`api-auth.md`](../.claude/rules/api-auth.md)). `GET /home`
(módulo `home`, resumo da tela inicial) ainda não tem `CLAUDE.md` próprio.

## Documentação OpenAPI

`springdoc-openapi-starter-webmvc-ui` (3.x) — só exposta com profile
`local` (ver [ADR 0007](../docs/adr/0007-openapi-via-springdoc.md)).
Swagger UI em `/swagger-ui.html`, spec em `/v3/api-docs`. Convenção de
anotação por endpoint (`@Operation` + `@ApiResponse`, sem wrapper) em
[`api-codigo.md`](../.claude/rules/api-codigo.md). Bean central em
`core/config/OpenApiConfig`.

## Convenções de código

Resumo (regra completa e motivos em
[`.claude/rules/api-codigo.md`](../.claude/rules/api-codigo.md), carregada ao
tocar `api/src/main/java/**`):

- Domínio em pt-BR, sufixo técnico em inglês, métodos de negócio no
  infinitivo (`Usuario`, `AutenticacaoService`, `cadastrar`).
- **Zero abreviação** em nomes (`duracaoTokenAcesso`, não `jwtTtl`); lambda
  com nome completo (`caractere`, não `c`).
- **Zero comentário `//`** em Java — nome de método bom ou javadoc curto no
  público.
- Entidade JPA sem regra de negócio (só booleano de consulta; mutação via
  `@Setter` decidida pelo service). Service decomposto em passos privados
  de uma responsabilidade. Sem interface de uma implementação só.
- Migrations: [`api-migrations.md`](../.claude/rules/api-migrations.md)
  (sequencial `V1`, `V2`; uma por feature). Testes:
  [`api-tests.md`](../.claude/rules/api-tests.md).

## Ponteiros

- [`core/CLAUDE.md`](src/main/java/com/dot/api/orbita/core/CLAUDE.md) — tabela classe → o que não é óbvio
- [`auth/CLAUDE.md`](src/main/java/com/dot/api/orbita/auth/CLAUDE.md) — contrato HTTP + regras de negócio
- ADRs: [0001 multiusuário](../docs/adr/0001-multiusuario-desde-o-dia-1.md),
  [0002 JWT sem lib](../docs/adr/0002-jwt-stateless-sem-lib-externa.md),
  [0004 protótipo auth](../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md),
  [0005 refresh token](../docs/adr/0005-refresh-token-opaco-com-rotacao.md),
  [0006 config](../docs/adr/0006-config-base-mais-application-local.md),
  [0007 OpenAPI](../docs/adr/0007-openapi-via-springdoc.md),
  [0008 erros em pt-BR](../docs/adr/0008-erros-http-em-pt-br-com-lista-de-campos.md),
  [0010 CORS](../docs/adr/0010-cors-front-api-servidores-diferentes.md)
- Rules (auto-carregadas por glob): `api-codigo.md`, `api-config.md`,
  `api-erros.md`, `api-migrations.md`, `api-tests.md`, `api-auth.md` em
  [`../.claude/rules/`](../.claude/rules/)
- Skill `revisar-sonar` — ao receber apontamentos do Sonar
- [`../front/CLAUDE.md`](../front/CLAUDE.md) — contrato HTTP consumido pelo front
