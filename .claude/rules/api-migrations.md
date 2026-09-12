---
paths:
  - "api/src/main/resources/db/**"
---

# Migrations Flyway

- Nome: `V<N>__<descricao_em_snake_case>.sql`, `N` sequencial simples (1, 2,
  3...) — não timestamp, não ligado à versão do `pom.xml` (que ainda muda
  várias vezes antes do 1.0 e não tem relação com o schema).
- Uma migration por feature/conjunto coeso de tabelas, não uma por tabela
  (ex.: `usuarios` + `tokens_confirmacao_email` + `tokens_atualizacao` da
  rotina de autenticação nasceram juntas em `V1__criar_autenticacao.sql`).
- Toda tabela de domínio tem `usuario_id` `NOT NULL` referenciando
  `usuarios`, com índice (`CREATE INDEX ... ON tabela (usuario_id)`).
  Exceção: `usuarios` — ela **é** o usuário, não tem essa coluna.
- **Nunca editar uma migration já aplicada** — mesmo em dev. Criar uma nova
  migration corretiva.
- Sem DDL fora de migration: `ddl-auto` do Hibernate deve ficar em
  `validate`, nunca `update`/`create`.
- Checklist ao adicionar coluna: nullable ou tem `DEFAULT`? precisa de
  índice? afeta constraint existente?
