/**
 * Usado em dev (`npm start` — configuração `development` é a padrão do
 * `ng serve`, ver `angular.json`). URL absoluta direto na API local: sem
 * proxy — a API já libera CORS pra `http://localhost:4200`
 * (`orbita.frontend-url` em `application-local.properties`), então não há
 * motivo pra um proxy só pra evitar CORS em dev.
 */
export const environment = {
  apiUrl: 'http://localhost:8080',
};
