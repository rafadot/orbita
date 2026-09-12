---
paths:
  - "api/src/test/**"
---

# Testes da API

- Testes de integração usam **Testcontainers** com Postgres real
  (`@ServiceConnection`) — nunca H2 ou banco in-memory.
- Uma classe base `AbstractIntegrationTest` compartilhada, sobe o container
  uma vez por suíte.
- Teste de controller autentica com JWT de teste (helper próprio ou
  `@WithMockUser` quando não precisar do token real) — nunca desliga
  segurança pra testar.
- Todo dado de teste é criado explicitamente para o usuário do teste; nunca
  assumir dado "global" no banco.
- Nomenclatura de método: `deve_<acao>_quando_<condicao>`.
