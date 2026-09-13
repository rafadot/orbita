<!-- Carregado só quando Claude lê algo dentro de front/. Manter < 150 linhas. -->

# front/ — Frontend Orbita

Ver visão geral e regras transversais em [`../CLAUDE.md`](../CLAUDE.md).

## Stack

Angular 22, standalone (sem NgModule), **zoneless**, Signals, Vitest, SCSS,
Prettier (config em `.prettierrc`: singleQuote, printWidth 100), npm 11.

## Comandos

```bash
npm start                    # dev server (localhost:4200)
npm test                     # Vitest (via `ng test`)
npm run build                # build de produção
npx prettier --write .       # formatação
```

## Estrutura

```
src/app/
├── core/
│   ├── api/         # ErroApi, erroApiInterceptor, tokenInterceptor, renovarSessaoInterceptor
│   └── auth/        # SessaoService, armazenamento-sessao, Usuario/TokensResponse, autenticadoGuard/anonimoGuard
├── shared/ui/       # Logo, Alerta, CampoSenha, Checkbox — sem estado, reutilizáveis
└── features/
    ├── auth/        # login, cadastro, confirmar-email — ver auth/CLAUDE.md da api
    │   ├── auth.routes.ts
    │   ├── pages/<pagina>/{<pagina>.ts,.html,.scss}
    │   ├── components/  # auth-shell, forca-senha
    │   ├── validators/senha-forte.ts   # replica @SenhaForte da API
    │   ├── auth.service.ts
    │   ├── auth.model.ts
    │   ├── email-pendente.ts   # sessionStorage do e-mail aguardando confirmação
    │   └── erros-formulario.ts # aplicarErrosDeCampo, formatarHorario
    └── painel/      # placeholder pós-login (GET /me + sair) até existir 1º módulo real
```

Regra de dependência: `features → shared → core`. Uma feature nunca importa
outra feature diretamente.

## Roteamento

Lazy loading por feature via `loadChildren` nas rotas de `<modulo>.routes.ts`.
`app.routes.ts` só registra as features, sem lógica. Guards de autenticação
(`autenticadoGuard`, `anonimoGuard`) moram em `core/auth/`.
`provideRouter(routes, withComponentInputBinding())` — rotas podem receber
query params direto como `input()` (ver `ConfirmarEmail.token`).

## Estado

Signals dentro do serviço da feature; `computed()` para valores derivados;
`resource()`/`httpResource()` para dados assíncronos. Sem NgRx, sem
`BehaviorSubject` novo — ver justificativa em
[`../docs/adr/0003-angular-signals-zoneless-sem-store.md`](../docs/adr/0003-angular-signals-zoneless-sem-store.md).

## Componentes (style guide Angular 20+)

- Nome de arquivo sem sufixo `.component` (`user-list.ts`, não
  `user-list.component.ts`); classe `UserList`.
- `inject()` em vez de injeção via construtor.
- `input()` / `output()` / `model()` em vez de decorators.
- `@if` / `@for` (com `track`) em vez de `*ngIf`/`*ngFor`.
- `ChangeDetectionStrategy.OnPush` em todo componente novo.
- Template sempre em arquivo externo (`templateUrl`), nunca inline para
  componentes com mais de poucas linhas.
- Checklist completo: [`.claude/rules/front-components.md`](../.claude/rules/front-components.md).

## HTTP

Sessão via `Authorization: Bearer`, tokens em `localStorage`/`sessionStorage`
conforme "manter conectado" — nunca cookie (avaliado e revertido, ver
[ADR 0009](../docs/adr/0009-sessao-bearer-storage-local.md)). Front e API
rodam em servidores diferentes, CORS liberado do lado da API (ver
[ADR 0010](../docs/adr/0010-cors-front-api-servidores-diferentes.md)).
Interceptors (ordem importa), `SessaoService`, split de `environment.ts`
por build config e tratamento de `ProblemDetail`:
[`.claude/rules/front-http.md`](../.claude/rules/front-http.md).

## UI — design system

Tokens (cor, tipografia, espaçamento, tema claro/escuro) já chegaram do
protótipo Claude Design de autenticação e estão em
`src/styles/_tokens.scss` — ver
[`.claude/rules/front-styles.md`](../.claude/rules/front-styles.md) para
convenção de uso e
[`../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md`](../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md)
para a origem.

Ainda **não** há biblioteca de componentes Angular escolhida (Material,
PrimeNG...). O que existe: componentes genéricos em `shared/ui/` (`Logo`,
`Alerta`, `CampoSenha`, `Checkbox` — os dois últimos são
`ControlValueAccessor`, usam com `formControlName` normalmente) e botão via
classes globais em `styles.scss` (`.botao.botao--primario/--secundario/--fantasma`,
`[aria-busy]` mostra `.botao__spinner`) — evita duplicar
`@include tokens.button-*` em cada componente. `AuthShell`
(`features/auth/components/`) é o layout comum das 3 telas de auth
(`@include tokens.auth-shell`). Vários estilos de componente passam do
budget de 4kB *warning* (nunca do *error* de 8kB) só por expandirem mixins
grandes do design system (`input-base`, `alert-base`) — aceito, é o preço
de reusar o mixin em vez de reinventar.

## Testes

Vitest, `*.spec.ts` ao lado do arquivo testado. Priorizar testar
services/signals (lógica) sobre templates triviais.

## Ponteiros

- [`.claude/rules/front-components.md`](../.claude/rules/front-components.md)
- [`.claude/rules/front-styles.md`](../.claude/rules/front-styles.md)
- [`.claude/rules/front-http.md`](../.claude/rules/front-http.md) — interceptors, sessão, `environment.ts`
- ADRs: [0003 signals](../docs/adr/0003-angular-signals-zoneless-sem-store.md),
  [0009 sessão Bearer](../docs/adr/0009-sessao-bearer-storage-local.md),
  [0010 CORS](../docs/adr/0010-cors-front-api-servidores-diferentes.md)
- [`../api/CLAUDE.md`](../api/CLAUDE.md) — contrato HTTP consumido daqui
