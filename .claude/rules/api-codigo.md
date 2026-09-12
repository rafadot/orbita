---
paths:
  - "api/src/main/java/**"
---

# Estilo de código Java — API

Convenções validadas em revisão pelo usuário (rodada de auth, set/2026).
Não são sugestão: divergir delas gera retrabalho. Motivo entre parênteses
quando não for óbvio.

## Nomes

- **Domínio em pt-BR, sufixo técnico em inglês**: `Usuario`,
  `AutenticacaoService`, `UsuarioRepository`, `CadastroRequest`,
  `PerfilController`. Métodos de negócio no **infinitivo em pt-BR**
  (`cadastrar`, `autenticar`, `confirmarEmail`, `renovarTokens`). Derivados
  do Spring Data ficam como o framework exige (`findByEmail`). Mensagens ao
  usuário em pt-BR.
- **Zero abreviação** em nome de campo, método, property ou variável:
  `duracaoTokenAcesso` (não `jwtTtl`), `numeroMaximoTentativasLogin` (não
  `maxTentativas`), `intervaloMinimoReenvioEmail` (não `cooldown`). Siglas
  consagradas de protocolo (`jwt`, `url`, `smtp`) podem ficar.
- Variável de lambda com nome completo: `caractere -> ...`, nunca `c -> ...`.
- Campo que guarda hash continua com `Hash` no nome (`senhaHash`) — é
  literalmente um hash, chamar de `senha` seria impreciso.
- Nome de classe não pode depender de convenção externa pra ser entendido:
  endpoint `/me` pode existir (convenção REST), mas a classe é
  `PerfilController`, não `MeController`.

## Comentários

- **Nenhum comentário inline (`//`) em Java.** O "o quê" vai no nome do
  método; o "por quê" não óbvio vai em **javadoc curto no método público**
  (1–3 linhas) — ex.: `AutenticacaoService.autenticar` explica a
  anti-enumeração em javadoc, não em `//` no meio do corpo.
- Javadoc de classe só quando a classe carrega uma decisão (ex.:
  `UsuarioAtual`, `ExcecaoDominio`). Não descrever o óbvio.
- Regra completa de negócio (ordem de checagens, casos silenciosos) mora no
  `CLAUDE.md` do módulo, não no código.
- Comentário em SQL de migration e em `.properties` é aceito (não há
  javadoc equivalente).

## Estrutura

- **Entidade JPA não tem regra de negócio.** Pode ter método **booleano**
  que só consulta o próprio estado (`emailConfirmado()`, `bloqueado(agora)`,
  `valido(agora)`). Qualquer mutação ou cálculo não-booleano (incrementar
  tentativa, decidir bloqueio, marcar usado/revogado, `tentativasRestantes`)
  é decisão do `Service`, que chama o `@Setter` direto.
- Lombok em entidade: `@Getter @Setter @Builder @NoArgsConstructor(PROTECTED)
  @AllArgsConstructor(PRIVATE)` (JPA exige o vazio; `@Builder` exige o
  completo quando outro construtor Lombok existe). Nunca `@Data`
  (equals/hashCode quebram com proxy). `toBuilder = true` só se um teste
  precisar. Ver `auth/domain/Usuario.java`.
- Fora de entidade: `@Getter` + `@RequiredArgsConstructor`; nunca getter
  manual quando `@Getter` resolve (Sonar aponta).
- **Service decomposto em passos privados de uma responsabilidade**, com
  nome pelo que fazem/validam: `buscarUsuarioParaLogin`,
  `validarContaDesbloqueada`, `validarSenha`, `validarEmailConfirmado`,
  `emitirTokens`. O método público vira a sequência legível desses passos.
  Ver `AutenticacaoService.autenticar` como referência. Não criar classe
  nova por passo — o service continua dono da operação.
- **Sem interface com uma única implementação** (`EnviadorEmail` é classe
  concreta, não interface + `EnviadorEmailSmtp`). Interface só quando há
  2+ implementações reais ou fronteira de módulo.
- Sem classe/interface aninhada pública.
- Exceção de domínio: `extends ExcecaoDominio`, passa **slug** (`"conflito"`,
  `"token-invalido"`), nunca URI completa — a base
  `https://orbita.app/erros/` está em `ExcecaoDominio.ERROS_BASE_URI`.
- Nova `@ConfigurationProperties` (record) precisa ser registrada em
  `@EnableConfigurationProperties` na `OrbitaApplication` — não é
  auto-descoberta.

## Antes de entregar

`./mvnw verify` verde (testes + JaCoCo ≥ 80% em services/utilitários).
Depois de rename, `grep -rn "<nomeAntigo>" api/src .claude docs` tem que
voltar vazio. Sonar: ver skill `revisar-sonar`.
