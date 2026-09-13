import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessaoService } from '../auth/sessao.service';
import { renovarSessaoInterceptor } from './renovar-sessao.interceptor';

describe('renovarSessaoInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([renovarSessaoInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('deve renovar a sessao e repetir a requisicao original quando recebe 401 com refresh guardado', async () => {
    localStorage.setItem('orbita.tokenAtualizacao', 'refresh-velho');
    const promessa = firstValueFrom(http.get(`${environment.apiUrl}/dados`));

    httpTesting
      .expectOne(`${environment.apiUrl}/dados`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    httpTesting.expectOne(`${environment.apiUrl}/auth/renovar`).flush({
      tokenAcesso: 'acesso-novo',
      tipoToken: 'Bearer',
      expiraEm: 900,
      tokenAtualizacao: 'refresh-novo',
    });
    const repeticao = httpTesting.expectOne(`${environment.apiUrl}/dados`);
    expect(repeticao.request.headers.get('Authorization')).toBe('Bearer acesso-novo');
    repeticao.flush({ ok: true });

    await expect(promessa).resolves.toEqual({ ok: true });
  });

  it('nao deve tentar renovar quando nao ha refresh guardado', async () => {
    const sessaoService = TestBed.inject(SessaoService);
    const promessa = firstValueFrom(http.get(`${environment.apiUrl}/dados`)).catch(
      (erro: unknown) => erro,
    );

    httpTesting
      .expectOne(`${environment.apiUrl}/dados`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    await promessa;

    expect(sessaoService.estado()).toBe('anonimo');
    // httpTesting.verify() no afterEach garante que /auth/renovar nao foi chamado
  });

  it('deve encerrar sessao local mas nao navegar quando a renovacao falha durante o bootstrap', async () => {
    localStorage.setItem('orbita.tokenAtualizacao', 'refresh-velho');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const sessaoService = TestBed.inject(SessaoService);
    sessaoService.estado.set('carregando');

    const promessa = firstValueFrom(http.get(`${environment.apiUrl}/dados`)).catch(
      (erro: unknown) => erro,
    );

    httpTesting
      .expectOne(`${environment.apiUrl}/dados`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    httpTesting
      .expectOne(`${environment.apiUrl}/auth/renovar`)
      .flush(null, { status: 400, statusText: 'Bad Request' });

    await promessa;

    expect(sessaoService.estado()).toBe('anonimo');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('deve encerrar sessao local e navegar para login quando a renovacao falha com sessao ja autenticada', async () => {
    localStorage.setItem('orbita.tokenAtualizacao', 'refresh-velho');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const sessaoService = TestBed.inject(SessaoService);
    sessaoService.estado.set('autenticado');

    const promessa = firstValueFrom(http.get(`${environment.apiUrl}/dados`)).catch(
      (erro: unknown) => erro,
    );

    httpTesting
      .expectOne(`${environment.apiUrl}/dados`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    httpTesting
      .expectOne(`${environment.apiUrl}/auth/renovar`)
      .flush(null, { status: 400, statusText: 'Bad Request' });

    await promessa;

    expect(sessaoService.estado()).toBe('anonimo');
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], expect.anything());
  });

  it('nao deve tentar renovar quando a propria requisicao ja e de /auth/', async () => {
    const promessa = firstValueFrom(http.post(`${environment.apiUrl}/auth/renovar`, {})).catch(
      (erro: unknown) => erro,
    );

    httpTesting
      .expectOne(`${environment.apiUrl}/auth/renovar`)
      .flush(null, { status: 400, statusText: 'Bad Request' });

    await promessa;
    // httpTesting.verify() no afterEach garante que nenhuma outra chamada foi feita
  });

  it('deve compartilhar uma unica renovacao entre requisicoes concorrentes', async () => {
    localStorage.setItem('orbita.tokenAtualizacao', 'refresh-velho');
    const p1 = firstValueFrom(http.get(`${environment.apiUrl}/a`));
    const p2 = firstValueFrom(http.get(`${environment.apiUrl}/b`));

    httpTesting
      .expectOne(`${environment.apiUrl}/a`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    httpTesting
      .expectOne(`${environment.apiUrl}/b`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    httpTesting.expectOne(`${environment.apiUrl}/auth/renovar`).flush({
      tokenAcesso: 'acesso-novo',
      tipoToken: 'Bearer',
      expiraEm: 900,
      tokenAtualizacao: 'refresh-novo',
    });

    httpTesting.expectOne(`${environment.apiUrl}/a`).flush({ a: true });
    httpTesting.expectOne(`${environment.apiUrl}/b`).flush({ b: true });

    await expect(Promise.all([p1, p2])).resolves.toEqual([{ a: true }, { b: true }]);
  });
});
