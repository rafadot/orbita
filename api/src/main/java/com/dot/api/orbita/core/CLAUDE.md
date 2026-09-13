<!-- Carregado só quando Claude lê algo em api/.../core/. Convenções gerais
     em api/CLAUDE.md; estilo de código em .claude/rules/api-codigo.md. -->

# core/ — Núcleo compartilhado por todos os módulos

Ver [`api/CLAUDE.md`](../../../../../../../../CLAUDE.md) (camadas, multiusuário)
e [`api-codigo.md`](../../../../../../../../../.claude/rules/api-codigo.md)
(estilo). Config/properties: [`api-config.md`](../../../../../../../../../.claude/rules/api-config.md).

Regra de ouro: `core/` **não conhece nenhum módulo** (`auth`, `financas`...).
Módulo importa `core`; o inverso nunca.

## O que tem aqui e o que não é óbvio

| Pacote | Classe | Não óbvio |
|---|---|---|
| `config` | `AutenticacaoProperties`, `FrontendProperties` | Records `@ConfigurationProperties`; registrados em `@EnableConfigurationProperties` na `OrbitaApplication` — **record novo precisa ser adicionado lá**. |
| `error` | `ExcecaoDominio` | Base abstrata; subclasse passa **slug**, a base monta `https://orbita.app/erros/<slug>` (`type` do RFC 9457 é identificador, não precisa resolver). `extensions` é `transient` (Sonar S1948 — `RuntimeException` é `Serializable`). Getters via `@Getter`. |
| `error` | `GlobalExceptionHandler` | Único handler; `extends ResponseEntityExceptionHandler` + `spring.mvc.problemdetails.enabled=true` cobre os erros nativos do MVC também. `title` em pt-BR vem de um mapa por `HttpStatus` aplicado no funil `createResponseEntity` (todo `ProblemDetail` do pai passa por ali); `detail` dos erros nativos vem de `messages.properties` via `MessageSourceAware` (locale fixo — ver `api-config.md`). `handleMethodArgumentNotValid` sobrescrito pra acrescentar a extensão `erros` (`{campo, mensagem}` por violação). |
| `error` | `NaoEncontradoException`, `ConflitoException` | Genéricas (404/409). Exceção específica de módulo fica **no módulo** (`auth/service/*Exception`), não aqui. |
| — | `messages.properties` (raiz de `resources/`) | Chave `problemDetail.<FQN da exceção>` — nome dado pelo próprio Spring (`ErrorResponse.getDefaultDetailMessageCode`); exceção nova do MVC sem tradução aqui volta a responder em inglês. |
| `error` | `package-info.java` | `@NullMarked` (JSpecify) — obrigatório porque `GlobalExceptionHandler` sobrescreve método de `ResponseEntityExceptionHandler`, cujo pacote no Spring 7 também é `@NullMarked`; sem isso o Sonar/SonarLint aponta parâmetro/retorno "not annotated" divergindo do contrato do pai. |
| `security` | `SecurityConfig` | `/auth/**` e a documentação OpenAPI público, resto autenticado, stateless, **CSRF desabilitado de propósito** (hotspot Sonar S4502 — revisar como Safe no SonarQube, não comentar no código). Método **não** declara `throws Exception`: `HttpSecurity.build()` do Spring Security 7.1 não lança mais. |
| `config` | `OpenApiConfig` | Bean `OpenAPI` (título + esquema de segurança Bearer/JWT global) + `OpenApiCustomizer` que registra o schema de `ProblemDetail` e o aplica a toda resposta de erro documentada sem `@Content` explícito. Exposição real controlada por `springdoc.*` (ver ADR 0007), não por este arquivo. |
| `security` | `JwtConfig` | HS256 com `SecretKeySpec(..., "HmacSHA256")` — string é o nome JCA oficial, não existe constante no JDK; manter. |
| `security` | `UsuarioAtual` | Única fonte do usuário logado (`sub` do JWT). Checa `Authentication != null` **e** `getSubject() != null` antes do `UUID.fromString` (dois apontamentos Sonar de NPE já resolvidos). |
| `security` | `GeradorToken` | `gerar()` (32 bytes base64url) + `hashear()` (SHA-256 hex). Compartilhado por refresh token **e** token de confirmação de e-mail — qualquer token opaco novo (reset de senha, 2FA) usa ele. |
| `security` | `SenhaConfig` | `Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8()`; exige `bcprov-jdk18on` explícito no `pom.xml` (Boot não gerencia). |
| `mail` | `EnviadorEmail` | **Classe concreta**, não interface — tinha interface + `EnviadorEmailSmtp` e foi removida (1 implementação só). Mockito mocka classe concreta normalmente. |
| `mail` | `MensagemEmail` | Record `(destinatario, assunto, corpo)`. Quem monta o texto é um `*Composer` no módulo (ex.: `auth/service/EmailConfirmacaoComposer`), não o `core`. |

## Testes

`core/security` e `core/error` entram na cobertura JaCoCo; `config` e
`*Config` não (ver `api-tests.md`). `UsuarioAtualTest` usa `Jwt` real +
`SecurityContextHolder` com `@AfterEach clearContext()`.
