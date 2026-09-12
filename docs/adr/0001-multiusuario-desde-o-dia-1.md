# 0001 — Multiusuário desde o dia 1

## Contexto

Orbita começa como uso pessoal do Rafael, mas o objetivo declarado é poder
escalar para amigos ou vender como produto. Adicionar suporte multiusuário
depois de o domínio existir exigiria migrar toda tabela e revisar toda
query já escrita.

## Decisão

Toda entidade de domínio nasce com `user_id NOT NULL`, e todo acesso a dado
passa pelo usuário autenticado (`CurrentUser`) desde a primeira feature —
mesmo que hoje só exista um usuário real.

## Consequências

- Nenhum repositório expõe `findById` cru para uso em endpoint; sempre
  `findByIdAndUserId` ou equivalente.
- Todo endpoint autenticado por padrão; só `/auth/**` é público.
- Custo inicial pequeno (uma coluna e um filtro a mais por query) evita
  retrabalho estrutural depois.
