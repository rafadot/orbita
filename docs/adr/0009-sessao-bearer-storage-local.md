# 0009 — Sessão via `Authorization: Bearer` + `localStorage`/`sessionStorage`

## Contexto

Cookie `HttpOnly` + `SameSite=Strict` foi implementado e testado de ponta a
ponta (protegia os tokens de XSS), mas exigiu CSRF ligado, `BearerTokenResolver`
customizado, dois cookies com `Path` diferentes e front/API sob o mesmo
site — complexidade desproporcional ao estágio atual do projeto. Revertido a
pedido do usuário antes de qualquer commit.

## Decisão

Tokens (acesso JWT + atualização opaco, ver ADR 0005) voltam no corpo JSON
de `/auth/login`/`/auth/renovar` e ficam guardados no front em
`localStorage` (quando "manter conectado" está marcado) ou `sessionStorage`
(quando não), nunca os dois ao mesmo tempo —
`front/src/app/core/auth/armazenamento-sessao.ts`. Front anexa
`Authorization: Bearer` via interceptor (`tokenInterceptor`).

## Consequências

- Token acessível a qualquer script no mesmo documento — um XSS que rode JS
  arbitrário consegue lê-lo. Aceito conscientemente em troca de
  simplicidade nesta fase; reavaliar se o produto ganhar usuários externos
  ou dados mais sensíveis.
- Sem exigência de mesmo domínio/site entre front e API — abre caminho para
  hospedá-los em servidores diferentes via CORS (ver ADR 0010).
- CSRF volta desligado — não há cookie de sessão pra forjar.
- Um interceptor de renovação de sessão nunca pode chamar `router.navigate`
  sem checar se a sessão já estava autenticada antes de falhar — durante o
  bootstrap (`provideAppInitializer`) isso corre com a navegação inicial do
  Router e a cancela silenciosamente. Bug real encontrado nesta correção;
  detalhe em `front/CLAUDE.md`.
