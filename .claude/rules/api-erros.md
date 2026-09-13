---
paths:
  - "api/src/main/java/**/core/error/**"
  - "api/src/main/resources/messages.properties"
---

# Erros HTTP — GlobalExceptionHandler e messages.properties

Decisão e motivo: [ADR 0008](../../docs/adr/0008-erros-http-em-pt-br-com-lista-de-campos.md).
Mecanismo classe a classe (tabela `Pacote | Classe | Não óbvio`) em
[`core/CLAUDE.md`](../../api/src/main/java/com/dot/api/orbita/core/CLAUDE.md).
Aqui: como estender com segurança sem reabrir o bug original (erro nativo
do Spring voltando em inglês, sem dizer qual campo falhou).

## Toda resposta de erro é pt-BR — não existe exceção "esquecida"

- `title`: mapa `TITULOS_EM_PORTUGUES` em `GlobalExceptionHandler`, aplicado
  no funil `createResponseEntity` — pega **todo** `ProblemDetail` que passa
  pelo `ResponseEntityExceptionHandler` pai, sem precisar overridar handler
  por handler. Status novo sem entrada no mapa cai no reason phrase em
  inglês — adicionar lá.
- `detail` de exceção nativa do Spring/MVC: chave em `messages.properties`
  = `problemDetail.<FQN completo da exceção>` (nome gerado pelo próprio
  Spring, `ErrorResponse.getDefaultDetailMessageCode`). Sem chave = volta a
  responder em inglês — era exatamente o bug original ("Invalid request
  content." vinha hardcoded no construtor de `MethodArgumentNotValidException`,
  usado sempre que `MessageSource` está `null` no momento do
  `updateAndGetBody`).
- 400 de validação de corpo (`@Valid` falhando): sempre carrega a extensão
  `erros: [{campo, mensagem}]`, formato consumido pelo front — é o
  `handleMethodArgumentNotValid` sobrescrito que cobre isso; não criar
  exceção/handler novo pra um caso de validação.

## Antes de adicionar uma chave nova em messages.properties

Não adivinhar o `{0}`/`{1}` da mensagem nem se a exceção realmente usa
`MessageSource` — **verificar no fonte real do Spring**, não em memória ou
documentação desatualizada:

1. `find ~/.m2 -iname "spring-web*-sources.jar" -o -iname "spring-webmvc*-sources.jar"`
   (já baixados pelo Maven; não precisa de rede).
2. `unzip -o -q <jar> <caminho/da/Excecao.java>` e ler o construtor —
   `getDetailMessageArguments()` (própria ou herdada de uma classe
   intermediária, ex. `HttpMediaTypeException`) diz a ordem dos argumentos.
   Se não há override em nenhum nível da hierarquia, os argumentos são
   `null` e um `{0}` no `messages.properties` fica sem substituir (a
   mensagem sai com o placeholder literal).
3. Conferir em `ResponseEntityExceptionHandler` (mesmo jar) se o `handleXxx`
   correspondente já passa um `messageCode`/`args` explícito em vez de
   deixar a própria exceção resolver — ex.: `MethodArgumentTypeMismatchException`
   **não tem chave própria** porque `handleTypeMismatch` sempre resolve
   pelo código de `TypeMismatchException.class`, não pelo tipo real da
   exceção lançada; uma chave separada pra ela nunca seria usada.
4. Rodar `./mvnw verify` (o teste de `GlobalExceptionHandlerTest` injeta um
   `MessageSource` real apontando pro `messages.properties` do classpath —
   pega chave ausente/errada sem precisar subir a API).
