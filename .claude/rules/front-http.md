---
paths:
  - "front/src/app/core/api/**"
  - "front/src/app/core/auth/**"
  - "front/src/environments/**"
---

# HTTP e sessão (front)

Sessão via `Authorization: Bearer` — tokens em `localStorage`/`sessionStorage`,
nunca cookie (por quê: [ADR 0009](../../docs/adr/0009-sessao-bearer-storage-local.md)).
Os tokens (acesso + atualização) vêm no corpo JSON de `/auth/login` e
`/auth/renovar` (ver [ADR 0005 da API](../../docs/adr/0005-refresh-token-opaco-com-rotacao.md))
e ficam guardados conforme "manter conectado"
(`core/auth/armazenamento-sessao.ts` — marcado → `localStorage`, sobrevive a
fechar o navegador; desmarcado → `sessionStorage`, some ao fechar).

## Interceptors (`app.config.ts`, nesta ordem — a mais perto do backend vem por último)

1. `erroApiInterceptor` — normaliza toda resposta de erro pra `ErroApi`
   (`core/api/erro-api.model.ts`).
2. `tokenInterceptor` — anexa `Authorization: Bearer` quando há token
   guardado.
3. `renovarSessaoInterceptor` — um 401 fora de `/auth/**` tenta
   `SessaoService.renovar()` uma vez e repete a requisição já com o token
   novo (`next(request)` não passa de novo por `tokenInterceptor`, então o
   header é reanexado ali mesmo); se não houver refresh guardado, nem
   tenta. **Só navega pro `/login` se a sessão já estava `autenticado`
   antes** — durante o bootstrap (`estado === 'carregando'`) um `navigate`
   correria com a navegação inicial do Router e a cancelaria
   silenciosamente. Bug real já causado por isso: qualquer URL aberta,
   incluindo `/confirmar-email?token=…`, caía direto em `/login` sem o
   componente de destino executar (ver ADR 0009).

## `environment.ts` — URL absoluta por ambiente, sem proxy

Front e API rodam em **servidores diferentes** (sem domínio nem proxy
comum, ver [ADR 0010](../../docs/adr/0010-cors-front-api-servidores-diferentes.md))
— por isso `apiUrl` é sempre uma URL **absoluta**, trocada por ambiente via
`fileReplacements` (`angular.json`):

- `environments/environment.ts` (base — usado no build de produção, já que
  `defaultConfiguration` do `build` é `production`): URL real da API,
  **preencher antes de implantar**.
- `environments/environment.development.ts` (usado no `npm start` —
  `defaultConfiguration` do `serve` é `development`): `http://localhost:8080`
  direto, sem proxy — a API já libera CORS pra `http://localhost:4200` via
  `orbita.frontend-url` (`application-local.properties`).

API precisa liberar a origem exata do front em produção — mesma property
`orbita.frontend-url` (env `ORBITA_FRONTEND_URL`).

## Erros e sessão

Todo `ProblemDetail` já chega com `title`/`detail` em pt-BR (fonte:
`GlobalExceptionHandler` na API). Um 400 de validação de corpo traz a
extensão `erros: [{campo, mensagem}]` (`ErroApi.erros`) —
`aplicarErrosDeCampo` (`features/auth/erros-formulario.ts`) seta
`control.setErrors({servidor: mensagem})` por campo. Um 401 de rota
protegida (JWT ausente/expirado) chega **sem corpo** — não é
`application/problem+json`, o `erroApiInterceptor` trata isso separado
(`tipo: 'nao-autenticado'`).

`SessaoService` (`core/auth/`) é a única fonte do estado de sessão: signals
`usuario`/`estado` (`'carregando'|'autenticado'|'anonimo'`), `restaurar()`
(chamado uma vez via `provideAppInitializer`, nunca lança — sem token
guardado, vira `anonimo` sem nenhuma requisição), `aposAutenticar(tokens,
manterConectado)` (login/cadastro bem-sucedidos), `sair()`. Guards
`autenticadoGuard`/`anonimoGuard` esperam `estado` sair de `'carregando'`.
