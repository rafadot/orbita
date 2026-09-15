import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { autenticadoGuard } from './autenticado.guard';
import { SessaoService } from './sessao.service';

describe('autenticadoGuard', () => {
  let sessaoService: SessaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    sessaoService = TestBed.inject(SessaoService);
  });

  function executar(url: string) {
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(
        autenticadoGuard(
          {} as ActivatedRouteSnapshot,
          { url } as RouterStateSnapshot,
        ) as Observable<boolean | UrlTree>,
      ),
    );
  }

  it('deve permitir quando autenticado', async () => {
    sessaoService.estado.set('autenticado');

    await expect(executar('/home')).resolves.toBe(true);
  });

  it('deve redirecionar para login com retorno quando anonimo', async () => {
    sessaoService.estado.set('anonimo');

    const resultado = await executar('/home');

    expect(resultado).toBeInstanceOf(UrlTree);
    expect((resultado as UrlTree).toString()).toContain('/login');
    expect((resultado as UrlTree).toString()).toContain('retorno');
  });
});
