import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { erroApiInterceptor } from './core/api/erro-api.interceptor';
import { renovarSessaoInterceptor } from './core/api/renovar-sessao.interceptor';
import { tokenInterceptor } from './core/api/token.interceptor';
import { SessaoService } from './core/auth/sessao.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([erroApiInterceptor, tokenInterceptor, renovarSessaoInterceptor]),
    ),
    provideAppInitializer(() => firstValueFrom(inject(SessaoService).restaurar())),
  ],
};
