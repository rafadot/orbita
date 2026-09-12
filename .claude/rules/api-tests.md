---
paths:
  - "api/src/test/**"
---

# Testes da API

**Decisão desta rodada**: só testes **unitários** (JUnit 5 + Mockito), sem
Testcontainers e sem banco real. Motivo: ainda não há dados reais para
exercitar em integração, e testes de integração consumiram tempo
desproporcional em tentativas anteriores (~90% do tempo em testes vs. 10%
codando). Quando o projeto tiver dados reais valendo a pena testar em
integração, esta decisão é revisitada — não antes.

- Cobertura mínima de **80% de linhas**, garantida por **JaCoCo**
  (`jacoco-maven-plugin`, goal `check` no `verify`). `./mvnw verify` falha
  se cair abaixo disso; relatório em `target/site/jacoco/index.html`.
- Cobertura medida só em **services + utilitários** (`core/security`,
  `core/error`, validadores, services). Excluído da medição: `dto`,
  `domain`, `config`, `*Config`, `*Properties`, controllers,
  `repository`, `OrbitaApplication` — plumbing que Mockito não testa bem e
  que não concentra regra de negócio.
- Regra de negócio mockando as dependências (repository, `PasswordEncoder`,
  `EnviadorEmail`, `GeradorToken`): não subir contexto Spring
  (`@SpringBootTest`/`@WebMvcTest`) a menos que estritamente necessário —
  é o que mais consome tempo sem agregar sinal nesta fase.
- Exceção pontual: um serviço que só compõe token JWT pode usar um
  `JwtEncoder`/`JwtDecoder` real com segredo fixo no teste (sem Spring) —
  mais barato que mockar claims e testa o token de fato (ver
  `JwtServiceTest`).
- Nomenclatura de método: `deve_<acao>_quando_<condicao>`.
- Todo teste cria seus próprios dados/mocks explicitamente; nunca assume
  estado "global".
