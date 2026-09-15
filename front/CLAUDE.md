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
│   ├── auth/        # SessaoService, armazenamento-sessao, Usuario/TokensResponse, autenticadoGuard/anonimoGuard
│   └── tema/        # TemaService (tema + onda de transição), armazenamento-tema, OndaTema (overlay, 1x em App)
├── shared/
│   ├── ui/          # Logo, AlternadorTema, Alerta, CampoSenha, Checkbox — sem estado, reutilizáveis
│   └── layout/      # Shell (sidebar/topbar/barra inferior das telas logadas), areas.ts, cabecalho.ts
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
    └── home/        # tela inicial pós-login — GET /home, ver home/CLAUDE.md da api
        ├── home.routes.ts
        ├── pages/inicio/    # decide a variante (carregando/erro/primeiro acesso/completa)
        ├── components/      # home-carregando (skeleton), primeiro-acesso
        ├── home.service.ts  # httpResource GET /home
        └── home.model.ts
```

Regra de dependência: `features → shared → core`. Uma feature nunca importa
outra feature diretamente.

## Roteamento

Lazy loading por feature via `loadChildren` nas rotas de `<modulo>.routes.ts`.
`app.routes.ts` só registra as features, sem lógica — a rota de toda tela
logada é filha de uma rota-layout sem path que renderiza `Shell`
(`shared/layout/shell`) atrás de `autenticadoGuard`; um módulo de vida novo
vira mais um filho dessa rota, não um shell próprio. Guards de autenticação
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

O ícone da Órbita é o botão de troca de tema (`shared/ui/alternador-tema`,
embutido no `Logo`) — hover/pulso de clique animam em CSS, a onda circular
(escuro→claro expande do ícone, claro→escuro encolhe até ele) é decidida e
temporizada por `core/tema/tema.service.ts` e renderizada uma única vez
(`OndaTema`) em `App`. Tema persiste em `localStorage` (`orbita-theme`).

Ainda **não** há biblioteca de componentes Angular escolhida (Material,
PrimeNG...). O que existe: componentes genéricos em `shared/ui/` (`Logo`,
`AlternadorTema`, `Alerta`, `CampoSenha`, `Checkbox` — os dois últimos são
`ControlValueAccessor`, usam com `formControlName` normalmente) e botão via
classes globais em `styles.scss` (`.botao.botao--primario/--secundario/--fantasma`,
`[aria-busy]` mostra `.botao__spinner`, `.cartao` é o fundo/borda/raio de
superfície repetido em todo cartão de tela logada, `.spinner` é o mesmo giro
solto fora de botão) — evita duplicar `@include tokens.button-*`/cor/borda em
cada componente. `AuthShell` (`features/auth/components/`) é o layout comum
das 3 telas de auth (`@include tokens.auth-shell`); `Shell`
(`shared/layout/`) é o equivalente pras telas logadas (sidebar de ícones no
desktop, barra inferior no mobile, topbar, menu do avatar — único lugar de
"Sair"). Vários estilos de componente passam do budget de 4kB *warning*
(nunca do *error* de 8kB) só por expandirem mixins grandes do design system
(`input-base`, `alert-base`) — aceito, é o preço de reusar o mixin em vez de
reinventar; quando o componente é grande o bastante pra chegar perto do
*error* de 8kB (`Shell`), prefira estilo manual enxuto a `@include` de um
mixin caro num elemento sempre `disabled`/decorativo (ver `.shell__busca`) e
um `%placeholder` + `@extend` pros resets repetidos — nunca através de uma
`@media`, Sass não permite.

## Testes

Vitest, `*.spec.ts` ao lado do arquivo testado. Priorizar testar
services/signals (lógica) sobre templates triviais. `httpResource` (de
`@angular/common/http`, não `@angular/core`) só roda em contexto de
injeção — criar com `TestBed.runInInjectionContext(() =>
servico.metodo())` e aguardar a requisição com `await vi.waitFor(() =>
httpTesting.expectOne(...))`, nunca `expectOne` direto (ela dispara num
microtask, não no mesmo tick) — ver `features/home/home.service.spec.ts`.

## Ponteiros

- [`.claude/rules/front-components.md`](../.claude/rules/front-components.md)
- [`.claude/rules/front-styles.md`](../.claude/rules/front-styles.md)
- [`.claude/rules/front-http.md`](../.claude/rules/front-http.md) — interceptors, sessão, `environment.ts`
- ADRs: [0003 signals](../docs/adr/0003-angular-signals-zoneless-sem-store.md),
  [0009 sessão Bearer](../docs/adr/0009-sessao-bearer-storage-local.md),
  [0010 CORS](../docs/adr/0010-cors-front-api-servidores-diferentes.md)
- [`../api/CLAUDE.md`](../api/CLAUDE.md) — contrato HTTP consumido daqui
