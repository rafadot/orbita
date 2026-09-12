# 0002 — JWT stateless sem lib externa

## Contexto

Precisamos de autenticação para uma API consumida por uma SPA e,
potencialmente, por integrações externas e apps futuros. O Spring Security
6+/Boot 4 já traz suporte nativo a JWT via `oauth2-resource-server`
(`JwtEncoder`/`JwtDecoder`), sem depender de libs de terceiros (ex.: jjwt).

## Decisão

Autenticação via JWT stateless, emitido e validado com os componentes
nativos do Spring Security (`spring-boot-starter-oauth2-resource-server`).
Sem sessão de servidor, sem CSRF. Único grupo de endpoints público:
`/auth/**` (login/registro/refresh).

## Consequências

- Menos dependências externas para manter atualizadas/auditar.
- API fica naturalmente stateless — facilita escalar horizontalmente e
  servir múltiplos clientes (SPA, app mobile futuro) com o mesmo mecanismo.
- Chave de assinatura/verificação configurada via ambiente, nunca commitada.
