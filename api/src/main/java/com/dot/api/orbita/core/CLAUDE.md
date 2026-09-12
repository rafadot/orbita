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
| `error` | `GlobalExceptionHandler` | Único handler; `extends ResponseEntityExceptionHandler` + `spring.mvc.problemdetails.enabled=true` cobre os erros nativos do MVC também. |
| `error` | `NaoEncontradoException`, `ConflitoException` | Genéricas (404/409). Exceção específica de módulo fica **no módulo** (`auth/service/*Exception`), não aqui. |
| `security` | `SecurityConfig` | `/auth/**` público, resto autenticado, stateless, **CSRF desabilitado de propósito** (hotspot Sonar S4502 — revisar como Safe no SonarQube, não comentar no código). Método **não** declara `throws Exception`: `HttpSecurity.build()` do Spring Security 7.1 não lança mais. |
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
