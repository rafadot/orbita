import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ErroApi } from './erro-api.model';
import { erroApiInterceptor } from './erro-api.interceptor';

describe('erroApiInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([erroApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('deve normalizar um problem+json com extensoes e erros de campo', async () => {
    const promessa = firstValueFrom(http.post('/api/auth/login', {})).catch(
      (erro: ErroApi) => erro,
    );

    httpTesting.expectOne('/api/auth/login').flush(
      {
        type: 'https://orbita.app/erros/credenciais-invalidas',
        title: 'Não autenticado',
        status: 401,
        detail: 'E-mail ou senha incorretos.',
        instance: '/auth/login',
        tentativasRestantes: 4,
      },
      { status: 401, statusText: 'Unauthorized' },
    );

    const erro = (await promessa) as ErroApi;
    expect(erro.status).toBe(401);
    expect(erro.tipo).toBe('credenciais-invalidas');
    expect(erro.titulo).toBe('Não autenticado');
    expect(erro.detalhe).toBe('E-mail ou senha incorretos.');
    expect(erro.extensoes).toEqual({ tentativasRestantes: 4 });
  });

  it('deve mapear erros de validacao', async () => {
    const promessa = firstValueFrom(http.post('/api/auth/cadastro', {})).catch(
      (erro: ErroApi) => erro,
    );

    httpTesting.expectOne('/api/auth/cadastro').flush(
      {
        type: 'https://orbita.app/erros/validacao',
        title: 'Requisição inválida',
        status: 400,
        detail: 'Um ou mais campos estão inválidos.',
        erros: [{ campo: 'email', mensagem: 'deve ser um endereço de e-mail bem formado' }],
      },
      { status: 400, statusText: 'Bad Request' },
    );

    const erro = (await promessa) as ErroApi;
    expect(erro.tipo).toBe('validacao');
    expect(erro.erros).toEqual([
      { campo: 'email', mensagem: 'deve ser um endereço de e-mail bem formado' },
    ]);
  });

  it('deve marcar como nao-autenticado um 401 sem corpo (resource server)', async () => {
    const promessa = firstValueFrom(http.get('/api/me')).catch((erro: ErroApi) => erro);

    httpTesting.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    const erro = (await promessa) as ErroApi;
    expect(erro.status).toBe(401);
    expect(erro.tipo).toBe('nao-autenticado');
  });

  it('deve marcar como indisponivel uma falha de rede', async () => {
    const promessa = firstValueFrom(http.get('/api/me')).catch((erro: ErroApi) => erro);

    httpTesting.expectOne('/api/me').error(new ProgressEvent('error'));

    const erro = (await promessa) as ErroApi;
    expect(erro.status).toBe(0);
    expect(erro.tipo).toBe('indisponivel');
  });
});
