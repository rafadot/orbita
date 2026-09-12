---
paths:
  - "api/src/main/resources/db/**"
---

# Migrations Flyway

- Nome: `V<yyyyMMddHHmm>__<descricao_em_snake_case>.sql` (timestamp garante
  ordem e evita colisão entre migrations criadas em paralelo).
- Toda tabela de domínio tem `user_id` `NOT NULL` referenciando o usuário,
  com índice (`CREATE INDEX ... ON tabela (user_id)`).
- **Nunca editar uma migration já aplicada** — mesmo em dev. Criar uma nova
  migration corretiva.
- Sem DDL fora de migration: `ddl-auto` do Hibernate deve ficar em
  `validate`, nunca `update`/`create`.
- Checklist ao adicionar coluna: nullable ou tem `DEFAULT`? precisa de
  índice? afeta constraint existente?
