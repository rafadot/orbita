import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessaoService } from './sessao.service';

describe('SessaoService', () => {
  let service: SessaoService;
  let httpTesting: HttpTestingController;

  const tokens = {
    tokenAcesso: 'token-acesso',
    tipoToken: 'Bearer',
    expiraEm: 900,
    tokenAtualizacao: 'token-atualizacao',
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessaoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('restaurar nao deve fazer nenhuma requisicao quando nao ha token guardado', async () => {
    await firstValueFrom(service.restaurar());

    expect(service.estado()).toBe('anonimo');
    httpTesting.expectNone(`${environment.apiUrl}/me`);
  });

  it('deve marcar autenticado e guardar o usuario quando GET /me responde com sucesso', async () => {
    const promessa = firstValueFrom(service.carregarUsuario());

    httpTesting.expectOne(`${environment.apiUrl}/me`).flush({
      id: '1',
      nome: 'Ana',
      email: 'ana@exemplo.com',
      emailConfirmadoEm: null,
      criadoEm: '2026-01-01T00:00:00Z',
    });

    await promessa;

    expect(service.estado()).toBe('autenticado');
    expect(service.usuario()?.nome).toBe('Ana');
  });

  it('restaurar nunca deve lancar erro quando ha token guardado mas GET /me falha', async () => {
    localStorage.setItem('orbita.tokenAcesso', 'token-velho');
    const promessa = firstValueFrom(service.restaurar());

    httpTesting
      .expectOne(`${environment.apiUrl}/me`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    await promessa;

    expect(service.estado()).toBe('anonimo');
    expect(service.usuario()).toBeNull();
  });

  it('aposAutenticar deve guardar em localStorage quando manterConectado', () => {
    service.aposAutenticar(tokens, true).subscribe();
    httpTesting.expectOne(`${environment.apiUrl}/me`).flush({
      id: '1',
      nome: 'Ana',
      email: 'ana@exemplo.com',
      emailConfirmadoEm: null,
      criadoEm: '2026-01-01T00:00:00Z',
    });

    expect(localStorage.getItem('orbita.tokenAcesso')).toBe('token-acesso');
    expect(sessionStorage.getItem('orbita.tokenAcesso')).toBeNull();
  });

  it('aposAutenticar deve guardar em sessionStorage quando nao manterConectado', () => {
    service.aposAutenticar(tokens, false).subscribe();
    httpTesting.expectOne(`${environment.apiUrl}/me`).flush({
      id: '1',
      nome: 'Ana',
      email: 'ana@exemplo.com',
      emailConfirmadoEm: null,
      criadoEm: '2026-01-01T00:00:00Z',
    });

    expect(sessionStorage.getItem('orbita.tokenAcesso')).toBe('token-acesso');
    expect(localStorage.getItem('orbita.tokenAcesso')).toBeNull();
  });

  it('deve compartilhar a chamada de renovar entre assinantes concorrentes', () => {
    sessionStorage.setItem('orbita.tokenAtualizacao', 'token-atualizacao');

    const primeira = service.renovar();
    const segunda = service.renovar();
    expect(primeira).toBe(segunda);

    primeira.subscribe();
    segunda.subscribe();

    httpTesting.expectOne(`${environment.apiUrl}/auth/renovar`).flush(tokens);
  });

  it('sair deve enviar o refresh guardado e limpar tokens ao final', () => {
    localStorage.setItem('orbita.tokenAcesso', 'token-acesso');
    localStorage.setItem('orbita.tokenAtualizacao', 'token-atualizacao');

    service.sair().subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(requisicao.request.body).toEqual({ tokenAtualizacao: 'token-atualizacao' });
    requisicao.flush(null, { status: 204, statusText: 'No Content' });

    expect(localStorage.getItem('orbita.tokenAcesso')).toBeNull();
    expect(localStorage.getItem('orbita.tokenAtualizacao')).toBeNull();
  });

  it('sair sem refresh guardado nao deve chamar a API', async () => {
    await firstValueFrom(service.sair());

    expect(service.estado()).toBe('anonimo');
    httpTesting.expectNone(`${environment.apiUrl}/auth/logout`);
  });

  it('encerrarLocal deve limpar o usuario, marcar anonimo e limpar os tokens', () => {
    localStorage.setItem('orbita.tokenAcesso', 'token-acesso');

    service.encerrarLocal();

    expect(service.estado()).toBe('anonimo');
    expect(service.usuario()).toBeNull();
    expect(localStorage.getItem('orbita.tokenAcesso')).toBeNull();
  });
});
