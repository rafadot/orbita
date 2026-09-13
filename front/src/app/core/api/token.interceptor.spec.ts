import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { tokenInterceptor } from './token.interceptor';

describe('tokenInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
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

  it('deve anexar Authorization quando ha token guardado', () => {
    localStorage.setItem('orbita.tokenAcesso', 'token-acesso');

    http.get(`${environment.apiUrl}/dados`).subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/dados`);
    expect(requisicao.request.headers.get('Authorization')).toBe('Bearer token-acesso');
    requisicao.flush({});
  });

  it('nao deve anexar Authorization quando nao ha token guardado', () => {
    http.get(`${environment.apiUrl}/dados`).subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/dados`);
    expect(requisicao.request.headers.has('Authorization')).toBe(false);
    requisicao.flush({});
  });

  it('nao deve anexar Authorization em /auth/** mesmo com token guardado', () => {
    localStorage.setItem('orbita.tokenAcesso', 'token-acesso');

    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe();

    const requisicao = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    expect(requisicao.request.headers.has('Authorization')).toBe(false);
    requisicao.flush({});
  });
});
