# 0006 — Config: base prod-ready + `application-local.properties` gitignored

## Contexto

Ao introduzir datasource, JWT e URL do front, surgiu a pergunta de onde
mora o valor de cada ambiente. Duas tentativas foram rejeitadas pelo
usuário: defaults locais embutidos na base (`${DB_URL:localhost:5434}`) e
split em `application-dev` + `application-prod` com `spring.profiles.active`
defaultando pra `dev`. Motivo: outro dev não usa a mesma porta/banco/front,
e a base já cumpre o papel de "prod" — não precisa de um terceiro arquivo.

## Decisão

Exatamente dois arquivos. `application.properties` é a base e serve a
qualquer ambiente, inclusive prod: todo valor pessoal ou segredo é `${VAR}`
sem default. `application-local.properties` (gitignored) sobrescreve com
valor real e adiciona o que só existe localmente (Mailpit, docker-compose).
Ativação explícita com profile `local`; nenhum profile é ativado por
default. Padrão que o usuário já usa nos outros projetos dele.

## Consequências

- Rodar sem `-Dspring-boot.run.profiles=local` e sem env vars falha no
  startup — é o comportamento desejado, não um bug a "consertar" com default.
- Prod, quando existir, injeta as `${VAR}` pelo ambiente (container,
  secret manager) e não precisa de arquivo novo.
- Novo valor pessoal ⇒ `${VAR}` na base **e** linha no
  `application-local.properties` (checklist em `api-config.md`).
- `CLAUDE.local.md` só aponta pro properties; não repete segredo.
- Nada de `SPRING_PROFILES_ACTIVE` exportado no shell como mecanismo
  principal — o flag do Maven é o caminho documentado.
