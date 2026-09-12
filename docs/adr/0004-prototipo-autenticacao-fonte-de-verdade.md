# 0004 — Protótipo de autenticação (Claude Design) como fonte de verdade

## Contexto

As próximas features (login, cadastro, recuperação de senha) precisam de
um design consistente no front e de um contrato de comportamento conhecido
pela API. Existe um protótipo no Claude Design — projeto "Autenticação
financeira super app"
(`https://claude.ai/design/p/9f402f22-770f-4b81-8de0-32c0486933a4`),
arquivo `Orbita - Autenticacao.dc.html` — especificando 6 telas (Login,
Cadastro, Confirmação de e-mail, Esqueci minha senha, Redefinir senha,
Verificação em duas etapas) com seus estados de validação, erro de
servidor, carregamento e sucesso. O texto dessas telas já embute regras de
negócio (hash de senha, invalidação de sessão, bloqueio por tentativas,
expiração de token/código) que a API precisa conhecer mesmo sem o
protótipo tratar de backend diretamente.

## Decisão

Adotar o protótipo como fonte única de verdade para autenticação, dos dois
lados:
- **Front**: tokens de design (cor, tipografia, espaçamento, tema
  claro/escuro, mixins de componente) portados verbatim do arquivo
  `_tokens.scss` do protótipo para `front/src/styles/_tokens.scss` — ver
  [`.claude/rules/front-styles.md`](../../.claude/rules/front-styles.md).
- **Back**: comportamento esperado (fluxos, regras, estados de erro)
  documentado a partir do texto das telas em
  [`.claude/rules/api-auth.md`](../../.claude/rules/api-auth.md).

Nenhum dos dois lados copia a tela inteira — só os tokens (que são código,
não documentação) e um resumo do comportamento. O protótipo em si continua
sendo a referência completa.

## Consequências

- Se o protótipo mudar no Claude Design, ressincronizar
  `_tokens.scss` e `api-auth.md` a partir de lá — eles não têm vida própria
  independente do protótipo.
- Escolha de biblioteca de componentes Angular e o mecanismo exato de
  invalidação de sessão/refresh token no back continuam em aberto — este
  ADR resolve a origem do design e do comportamento esperado, não a
  implementação.
