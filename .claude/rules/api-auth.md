---
paths:
  - "api/src/main/java/**/auth/**"
---

# Autenticação — comportamento esperado

O protótipo de autenticação no Claude Design (ver
[`../../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md`](../../docs/adr/0004-prototipo-autenticacao-fonte-de-verdade.md))
não trata do backend, mas o texto das telas já embute regras de negócio
que os serviços deste módulo precisam cumprir. Checklist extraído de lá —
não é o desenho da implementação, é o comportamento que ela precisa
respeitar.

- **Cadastro**: nome/e-mail/senha; senha com hash Argon2 (compromisso
  assumido no texto da tela de cadastro — `Argon2PasswordEncoder` do
  Spring Security); aceite obrigatório de termos; envia e-mail de
  confirmação com link que expira em 30 min; e-mail já cadastrado responde
  como conflito, sem criar duplicata.
- **Confirmação de e-mail**: endpoint de verificação do token; reenvio com
  cooldown (a tela mostra contador regressivo).
- **Login**: e-mail + senha; contador de tentativas com bloqueio temporário
  após excedê-las (a tela mostra "restam N tentativas"); "manter conectado"
  afeta duração/persistência do refresh token; login social (Google/Apple)
  é alternativa reservada na UI, não obrigatória nesta rodada.
- **Esqueci minha senha**: resposta sempre genérica, mesmo se o e-mail não
  existir (anti-enumeração — a tela é explícita sobre isso); rate limit
  próprio (bloqueio citado de ~10 min após excesso de pedidos).
- **Redefinir senha**: token de uso único e expirável; regras de senha
  (mín. 10 caracteres, maiúscula ou número, símbolo, diferente das 3
  últimas usadas — exige histórico de senha, não só a atual); ao salvar,
  invalida sessões ativas em outros dispositivos.
- **2FA**: código de 6 dígitos, expira em 5 min, reenvio com cooldown,
  suporte a código de backup; bloqueio temporário (~30 min) após excesso
  de tentativas; canal inicial é e-mail — o protótipo comenta troca futura
  por app autenticador (TOTP), não obrigatória agora.

## Implementado

Cadastro, confirmação de e-mail (+ reenvio com cooldown), login com
bloqueio por tentativas, refresh token com rotação, logout, `GET /me`. A
invalidação de sessão num esquema JWT stateless foi resolvida com refresh
token opaco hasheado + rotação — ver
[`../../docs/adr/0005-refresh-token-opaco-com-rotacao.md`](../../docs/adr/0005-refresh-token-opaco-com-rotacao.md).

## Em aberto (próxima rodada, fora do escopo desta)

- **Esqueci minha senha** e **Redefinir senha**: token opaco de uso único
  (mesmo padrão de `GeradorToken`/hash já usado aqui), histórico das 3
  últimas senhas (`historico_senhas`, tabela nova), invalidar sessões ativas
  ao redefinir (revogar todos os refresh tokens do usuário — já existe
  `revogarTodosDoUsuario`).
- **2FA**: código de 6 dígitos, cooldown de reenvio, código de backup,
  bloqueio por excesso de tentativas.
- Integração OAuth social (Google/Apple) — a UI reserva o espaço, mas
  entrar ou não é decisão de escopo, não de design.
