<!-- Carregado só quando Claude lê algo dentro de api/. Manter < 150 linhas. -->

# api/ — Backend Orbita

Ver visão geral e regras transversais em [`../CLAUDE.md`](../CLAUDE.md).

## Stack

Spring Boot 4.1.1, Java 25, PostgreSQL, Flyway, Spring Security, Lombok,
Bean Validation, Spring Mail. Módulo Maven único (`com.dot.api.orbita`).

⚠️ `pom.xml` ainda **não tem** `spring-boot-starter-data-jpa` — adicionar na
primeira entidade real (nenhuma entidade/repository existe ainda).

## Ambiente local

- Postgres em `localhost:5434`, database `orbita`.
- Credenciais só via variável de ambiente ou `../CLAUDE.local.md` — nunca
  hardcoded em `application.properties`. Usar `${DB_URL:...}`,
  `${DB_USERNAME:...}`, `${DB_PASSWORD}` (sem default para senha).

## Comandos

```bash
./mvnw spring-boot:run                  # dev
./mvnw test                             # todos os testes (ver api-tests.md)
./mvnw compile -DskipTests              # validação rápida de compilação
```

## Estrutura de pacotes

Por **módulo de domínio**, não por camada global:

```
com.dot.api.orbita/
├── core/
│   ├── security/      # JWT, filtros, CurrentUser
│   ├── config/
│   ├── error/         # GlobalExceptionHandler, ProblemDetail
│   └── mail/
├── integration/
│   └── <provedor>/    # cliente externo isolado, nunca vaza tipo pro domínio
└── <modulo>/           # ex.: financas, saude...
    ├── api/            # Controller + DTOs (records)
    ├── service/
    ├── domain/         # entidades JPA
    └── repository/
```

Regra: um módulo nunca importa `service`/`repository` de outro módulo
diretamente — só através de um serviço exposto publicamente (interface em
`api` ou classe pública do módulo).

## Multi-usuário (regra de negócio central)

- Toda entidade de domínio tem `user_id NOT NULL` com índice.
- `CurrentUser` (em `core/security`) é a única fonte do usuário autenticado.
- Repositórios expõem métodos que recebem `userId` explicitamente
  (`findByIdAndUserId`, `findAllByUserId`...) — nunca um `findById` cru
  usado direto num endpoint.

## Camadas

`Controller` (`@RestController`, só valida e traduz request/response) →
`Service` (`@Transactional` sempre aqui, nunca no controller) →
`Repository` (Spring Data JPA).

- Request/response são `record` — a entidade JPA nunca sai do controller.
- Construtor injection (via Lombok `@RequiredArgsConstructor`), nunca
  `@Autowired` em campo.

## Erros

Um único `GlobalExceptionHandler` (`core/error`) traduzindo exceções de
domínio (`NotFoundException`, `BusinessException`, etc.) para
`ProblemDetail` (RFC 9457, nativo do Spring). Nunca stack trace cru na
resposta.

## Segurança

JWT stateless via `spring-boot-starter-oauth2-resource-server` (sem lib
externa de JWT) — ver [`../docs/adr/0002-jwt-stateless-sem-lib-externa.md`](../docs/adr/0002-jwt-stateless-sem-lib-externa.md).
Único grupo de endpoints público: `/auth/**`. Sem sessão, sem CSRF.

Comportamento esperado do módulo `auth` (extraído do protótipo de design,
que não trata de backend mas embute regras de negócio no texto das telas):
ver [`.claude/rules/api-auth.md`](../.claude/rules/api-auth.md) e
[`../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md`](../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md).

## Convenções de código

- Lombok: só `@Getter`, `@Builder`, `@RequiredArgsConstructor`. Nunca
  `@Data` em entidade JPA (equals/hashCode quebram com proxies/coleções).
- Nomes de classe/método/variável em inglês; mensagens ao usuário em pt-BR.
- Sem classes ou interfaces aninhadas públicas.
- Migrations Flyway: ver [`.claude/rules/api-migrations.md`](../.claude/rules/api-migrations.md).
- Testes: ver [`.claude/rules/api-tests.md`](../.claude/rules/api-tests.md).

## Ponteiros

- [`../docs/adr/0001-multiusuario-desde-o-dia-1.md`](../docs/adr/0001-multiusuario-desde-o-dia-1.md)
- [`../docs/adr/0002-jwt-stateless-sem-lib-externa.md`](../docs/adr/0002-jwt-stateless-sem-lib-externa.md)
- [`../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md`](../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md)
- [`.claude/rules/api-auth.md`](../.claude/rules/api-auth.md) — ao tocar `api/src/main/java/**/auth/**`
- [`../front/CLAUDE.md`](../front/CLAUDE.md) — contrato HTTP consumido pelo front
