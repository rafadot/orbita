/**
 * Usado no build de produção (`npm run build` — configuração `production`
 * é a padrão, ver `angular.json`). Front e API rodam em servidores
 * diferentes (sem domínio/proxy comum) — por isso a URL aqui é absoluta,
 * não relativa como em dev. Preencher antes de implantar; a API precisa
 * liberar essa mesma origem em CORS (`orbita.frontend-url`, ver
 * `core/CLAUDE.md` da API).
 */
export const environment = {
  apiUrl: 'https://TROQUE-PELA-URL-DA-API-EM-PRODUCAO',
};
