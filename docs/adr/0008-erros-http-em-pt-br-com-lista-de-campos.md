# 0008 — Respostas de erro sempre em pt-BR, validação com lista de campos

## Contexto

`GlobalExceptionHandler` delegava pro `ResponseEntityExceptionHandler` do
Spring sem `MessageSource` configurado: todo 400 de validação respondia
`{"detail":"Invalid request content.","title":"Bad Request"}` — em inglês
e sem apontar qual campo falhou, obrigando o cliente (front, Postman) a
adivinhar o problema.

## Decisão

Locale fixo pt-BR (`spring.mvc.locale`) + `messages.properties` traduzindo
o `detail` de toda exceção nativa do MVC; `title` centralizado por
`HttpStatus` em `GlobalExceptionHandler`. 400 de validação de corpo ganha a
extensão `erros: [{campo, mensagem}]` (ordenada por campo, `type=.../erros/validacao`)
em vez de mapa `{campo: mensagem}` ou tudo concatenado em `detail` —
formato escolhido com o usuário por comportar erro sem campo (validação de
classe) e vários erros no mesmo campo sem perda.

## Consequências

- Todo `ProblemDetail` (domínio ou nativo do Spring) sai em pt-BR, mesmo
  com `Accept-Language` diferente — decisão deliberada, API não é
  multi-idioma nesta rodada.
- Exceção nova do MVC sem chave em `messages.properties` volta a responder
  em inglês silenciosamente — checklist de verificação (como achar a
  chave/argumentos certos no fonte do Spring) em
  [`.claude/rules/api-erros.md`](../../.claude/rules/api-erros.md).
- Front consome `erros` mapeando por `campo` pra cada input — contrato em
  [`front/CLAUDE.md`](../../front/CLAUDE.md).
- Mecanismo linha a linha (`createResponseEntity` como funil,
  `handleMethodArgumentNotValid` sobrescrito) em
  [`core/CLAUDE.md`](../../api/src/main/java/com/dot/api/orbita/core/CLAUDE.md).
