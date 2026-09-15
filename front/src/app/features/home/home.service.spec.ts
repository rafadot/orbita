import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HomeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('carregarResumo deve começar carregando e expor o resultado de GET /home', async () => {
    const resumo = TestBed.runInInjectionContext(() => service.carregarResumo());

    expect(resumo.isLoading()).toBe(true);

    const requisicao = await vi.waitFor(() => httpTesting.expectOne(`${environment.apiUrl}/home`));
    expect(requisicao.request.method).toBe('GET');
    requisicao.flush({ primeiroAcesso: true });

    await vi.waitFor(() => expect(resumo.isLoading()).toBe(false));
    expect(resumo.value()).toEqual({ primeiroAcesso: true });
  });

  it('carregarResumo deve expor o erro quando a requisição falha', async () => {
    const resumo = TestBed.runInInjectionContext(() => service.carregarResumo());

    const requisicao = await vi.waitFor(() => httpTesting.expectOne(`${environment.apiUrl}/home`));
    requisicao.flush(null, { status: 500, statusText: 'Erro interno' });

    await vi.waitFor(() => expect(resumo.isLoading()).toBe(false));
    expect(resumo.error()).toBeTruthy();
  });
});
