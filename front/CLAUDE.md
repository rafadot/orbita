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
├── core/            # auth, interceptors, guards, cliente HTTP, layout raiz
├── shared/          # ui/pipes/utils sem estado, reutilizáveis entre features
└── features/
    └── <modulo>/    # mesmo nome do módulo na api (ex.: financas)
        ├── <modulo>.routes.ts
        ├── pages/
        ├── components/
        ├── <modulo>.service.ts   # signals + chamadas HTTP
        └── <modulo>.model.ts
```

Regra de dependência: `features → shared → core`. Uma feature nunca importa
outra feature diretamente.

## Roteamento

Lazy loading por feature via `loadChildren` nas rotas de `<modulo>.routes.ts`.
`app.routes.ts` só registra as features, sem lógica. Guard de autenticação
mora em `core/`.

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

Cliente centralizado em `core/api/`, com interceptor que injeta
`Authorization: Bearer <jwt>` e trata erro `application/problem+json` num
único lugar. Base URL por `environments/`. Em dev, `proxy.conf.json`
encaminha `/api` → `http://localhost:8080` (arquivo a criar na primeira
feature que consumir a API).

## UI — TODO (aguardando design)

Ainda **não** há biblioteca de UI escolhida (Material, PrimeNG, etc.) nem
design system. O usuário tem um design feito no Claude Design e vai
compartilhar depois. **Não escolher lib nem criar componentes visuais
genéricos antes disso** — só estrutura/lógica.

## Testes

Vitest, `*.spec.ts` ao lado do arquivo testado. Priorizar testar
services/signals (lógica) sobre templates triviais.

## Ponteiros

- [`.claude/rules/front-components.md`](../.claude/rules/front-components.md)
- [`.claude/rules/front-styles.md`](../.claude/rules/front-styles.md)
- [`../docs/adr/0003-angular-signals-zoneless-sem-store.md`](../docs/adr/0003-angular-signals-zoneless-sem-store.md)
- [`../api/CLAUDE.md`](../api/CLAUDE.md) — contrato HTTP consumido daqui
