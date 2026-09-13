import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { anonimoGuard } from './anonimo.guard';
import { SessaoService } from './sessao.service';

describe('anonimoGuard', () => {
  let sessaoService: SessaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    sessaoService = TestBed.inject(SessaoService);
  });

  function executar() {
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(
        anonimoGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as Observable<
          boolean | UrlTree
        >,
      ),
    );
  }

  it('deve permitir quando anonimo', async () => {
    sessaoService.estado.set('anonimo');

    await expect(executar()).resolves.toBe(true);
  });

  it('deve redirecionar para o painel quando ja autenticado', async () => {
    sessaoService.estado.set('autenticado');

    const resultado = await executar();

    expect(resultado).toBeInstanceOf(UrlTree);
    expect((resultado as UrlTree).toString()).toContain('/painel');
  });
});
