import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('entrar deve chamar POST /api/auth/login com o corpo informado', () => {
    service
      .entrar({ email: 'ana@exemplo.com', senha: 'Senha#Forte10', manterConectado: true })
      .subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({
      email: 'ana@exemplo.com',
      senha: 'Senha#Forte10',
      manterConectado: true,
    });
    requisicao.flush({
      tokenAcesso: 'token-acesso',
      tipoToken: 'Bearer',
      expiraEm: 900,
      tokenAtualizacao: 'token-atualizacao',
    });
  });

  it('cadastrar deve chamar POST /api/auth/cadastro com o corpo informado', () => {
    service
      .cadastrar({
        nome: 'Ana Ribeiro',
        email: 'ana@exemplo.com',
        senha: 'Senha#Forte10',
        aceitouTermos: true,
      })
      .subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/auth/cadastro`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({
      nome: 'Ana Ribeiro',
      email: 'ana@exemplo.com',
      senha: 'Senha#Forte10',
      aceitouTermos: true,
    });
    requisicao.flush(null, { status: 201, statusText: 'Created' });
  });

  it('confirmarEmail deve chamar POST /api/auth/email/confirmar com o token', () => {
    service.confirmarEmail('token-cru').subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/auth/email/confirmar`);
    expect(requisicao.request.body).toEqual({ token: 'token-cru' });
    requisicao.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('reenviarConfirmacao deve chamar POST /api/auth/email/reenviar com o e-mail', () => {
    service.reenviarConfirmacao('ana@exemplo.com').subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/auth/email/reenviar`);
    expect(requisicao.request.body).toEqual({ email: 'ana@exemplo.com' });
    requisicao.flush(null, { status: 202, statusText: 'Accepted' });
  });
});
