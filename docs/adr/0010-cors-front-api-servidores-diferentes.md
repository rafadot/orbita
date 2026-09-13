# 0010 — CORS: front e API em servidores diferentes

## Contexto

Front e API vão rodar em servidores/hosts completamente diferentes, sem
domínio próprio e sem reverse proxy compartilhado entre eles. Sem cookie de
sessão (ver ADR 0009), não existe mais exigência de mesmo site — só falta
liberar a origem do front na API.

## Decisão

`SecurityConfig` habilita CORS via `CorsConfigurationSource`, reusando
`orbita.frontend-url` (`FrontendProperties`, já existia para montar o link
do e-mail de confirmação) como única origem permitida, sem
`allowCredentials` (sessão vai em `Authorization`, nunca em cookie — nada de
credencial de navegador a liberar). Front usa URL **absoluta** da API por
ambiente (`environment.ts` vs `environment.development.ts`, trocados via
`fileReplacements` do Angular), sem proxy de dev.

## Consequências

- Uma única origem confiável por ambiente — múltiplos fronts (staging, app
  mobile futuro) exigiriam lista de origens; não suportado ainda.
- `registerCorsConfiguration("/**", ...)` casa **path** (toda rota da API),
  não origem — quem restringe a origem é `setAllowedOrigins`. Ponto de
  confusão já esclarecido uma vez; não relitigar.
- Build de produção do front exige preencher `environment.ts` com a URL
  real da API **antes do build** (decisão explícita: fixo no build, não
  config em runtime — rebuild necessário se o endereço da API mudar).
- API precisa de `ORBITA_FRONTEND_URL` apontando pro domínio real do front
  em produção; local já é `http://localhost:4200`.
