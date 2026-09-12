# 0005 — Refresh token opaco com rotação, guardado hasheado

## Contexto

JWT stateless (ADR 0002) não guarda estado de sessão no servidor, mas
"manter conectado" e a própria noção de logout exigem algum jeito de revogar
acesso antes do token expirar — o "em aberto" deixado em
[`api-auth.md`](../../.claude/rules/api-auth.md). Um access token JWT de
vida curta sozinho não resolve: expirar rápido demais incomoda o usuário,
expirar devagar demais impede revogação.

## Decisão

Dois tokens por login: um **access token JWT** (15 min, sem estado) e um
**refresh token opaco** (32 bytes aleatórios, nunca um JWT) guardado
**hasheado (SHA-256)** em `tokens_atualizacao`, nunca em claro. Cada uso do
refresh token o **rotaciona**: o antigo é revogado e um novo é emitido. Reuso
de um token já rotacionado é tratado como sinal de roubo e revoga todos os
tokens do usuário. TTL do refresh: 1 dia normal, 30 dias com "manter
conectado" (campo `persistente`). Ambos os tokens voltam no corpo JSON da
resposta (não em cookie) — decisão de manter o contrato agnóstico de
cliente (SPA hoje, app mobile depois).

## Consequências

- É o único estado de sessão que a API mantém — uma tabela, não um esquema
  de sessão completo.
- Logout é apenas revogar o refresh token atual; nenhuma lista de
  revogação de access tokens é necessária (eles expiram em 15 min).
- Front precisa guardar o refresh token (ex.: storage local) e reenviá-lo em
  `/auth/renovar` — responsabilidade dele, não de cookie automático do
  browser.
- Histórico de senha e redefinição de senha (próxima rodada) reusam o mesmo
  padrão de token opaco + hash, já estabelecido aqui.
