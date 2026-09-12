<!-- Carregado só quando Claude lê algo em api/.../auth/. Convenções gerais de
     pacote Java estão em api/CLAUDE.md. -->

# auth/ — Cadastro e autenticação

Ver stack/camadas/convenções gerais em [`api/CLAUDE.md`](../../../../../../../../CLAUDE.md).
Comportamento esperado (extraído do protótipo de design) em
[`api-auth.md`](../../../../../../../../../.claude/rules/api-auth.md).
Refresh token opaco + rotação: [ADR 0005](../../../../../../../../../docs/adr/0005-refresh-token-opaco-com-rotacao.md).

## Contrato HTTP

| Método/Path | Sucesso | Erros |
|---|---|---|
| `POST /auth/cadastro` | `201` | `400` validação, `409` e-mail já cadastrado |
| `POST /auth/email/confirmar` | `204` | `400` token inválido/expirado/usado |
| `POST /auth/email/reenviar` | `202` (sempre, anti-enumeração) | — |
| `POST /auth/login` | `200 TokensResponse` | `401` + `tentativasRestantes`, `423` + `bloqueadoAte`, `403` e-mail não verificado |
| `POST /auth/renovar` | `200 TokensResponse` | `401` token inválido/expirado/revogado |
| `POST /auth/logout` | `204` (idempotente) | — |
| `GET /me` | `200 UsuarioResponse` | `401` |

## Regras não óbvias pelo código

- **Ordem de checagem no login** (`AutenticacaoService.autenticar`):
  usuário inexistente → mesma exceção de senha errada com
  `tentativasRestantes` fixo no máximo (anti-enumeração); bloqueado → 423
  antes de checar senha; senha errada → registra tentativa, só então checa
  se acabou de bloquear; e-mail não verificado só é checado **depois** da
  senha correta (não revela estado da conta sem credencial válida).
- **Reenvio de confirmação** (`CadastroService.reenviarConfirmacao`) é
  sempre silencioso — e-mail inexistente, já confirmado ou dentro do
  cooldown (1 min) não geram erro nem sinal distinguível pro cliente.
- **Reuso de refresh token já rotacionado** (`AutenticacaoService.renovarTokens`)
  revoga **todos** os tokens do usuário — tratado como sinal de roubo, não
  como erro comum de token expirado.
- `GET /me` (`PerfilController.buscarUsuarioAutenticado`) é o único lugar
  com `findById` direto num endpoint — seguro porque o id vem de
  `UsuarioAtual.id()` (claim `sub` do JWT), nunca de input do cliente. O
  nome "/me" é convenção comum de API REST (GitHub, X/Twitter...) pro
  "usuário autenticado atual" — a classe chama `PerfilController` pra não
  depender dessa convenção pra ficar clara.
- `type` de `ProblemDetail`: cada `*Exception` em `service/` passa só o
  slug (`"credenciais-invalidas"`); a base `https://orbita.app/erros/` está
  em `ExcecaoDominio` (`core/error`).
- Entidades (`Usuario`, `TokenAtualizacao`, `TokenConfirmacaoEmail`) não
  têm mutador de negócio — contador de tentativas, bloqueio, `usadoEm`,
  `revogadoEm` são decididos e setados pelos services via `@Setter`. Os
  passos estão em métodos privados nomeados (`validarSenha`,
  `registrarTentativaFalha`, `validarTokenNaoReutilizado`...) — ler o método
  público é ler a sequência. Regra geral em `.claude/rules/api-codigo.md`.

## Fora do escopo desta rodada

Esqueci/redefinir senha, histórico de senha, 2FA, login social — ver
"Em aberto" em `.claude/rules/api-auth.md`. O schema (`tokens_atualizacao`,
`tokens_confirmacao_email`) já segue o padrão que essas features vão reusar.
