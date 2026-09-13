---
paths:
  - "front/src/app/**/*.ts"
  - "front/src/app/**/*.html"
---

# Componentes Angular

- `ChangeDetectionStrategy.OnPush` sempre.
- Sem lógica no template além de bindings simples e `@if`/`@for` — lógica
  vai no componente/serviço.
- `@for` sempre com `track` explícito (nunca `track $index` se houver id
  estável disponível).
- Fetch de dados via `resource()`/`httpResource()`, não `ngOnInit` +
  subscribe manual.
- `input()`/`output()`/`model()` em vez de `@Input()`/`@Output()`.
- `inject()` em vez de injeção via construtor.
- Acessibilidade mínima: todo elemento clicável interativo tem `role`/`type`
  correto e é alcançável por teclado.

## Formulários (Reactive Forms)

- `ReactiveFormsModule`, nunca template-driven (`ngModel`).
- Erro de campo só aparece após `blur` ou submit — nunca no primeiro
  caractere digitado. Padrão: `controle.invalid && (controle.touched ||
  formSubmetido())` (signal `formSubmetido` setado no início do handler de
  submit). Ver `features/auth/pages/login/login.ts`.
- Um 400 de validação da API (`erros: [{campo, mensagem}]`) vira
  `controle.setErrors({servidor: mensagem})` por campo — usar
  `aplicarErrosDeCampo` (`features/auth/erros-formulario.ts`) em vez de
  reescrever esse mapeamento em cada página.
- Campo inválido ganha `[attr.aria-invalid]="'true'"` e
  `[attr.aria-describedby]` apontando pro `id` da mensagem de erro — nunca
  só cor para indicar erro.
- Componente de formulário reutilizável (senha, checkbox) implementa
  `ControlValueAccessor` e é consumido com `formControlName` normal — ver
  `shared/ui/campo-senha` e `shared/ui/checkbox`.
