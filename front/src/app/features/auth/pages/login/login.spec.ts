import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';
import { ErroApi } from '../../../../core/api/erro-api.model';
import { AuthService } from '../../auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let authService: { entrar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = { entrar: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
  });

  function submeter(email: string, senha: string): void {
    fixture.componentInstance['form'].setValue({ email, senha, manterConectado: true });
    fixture.componentInstance['aoSubmeter']();
    fixture.detectChanges();
  }

  it('mostra o detalhe da API e a mensagem de tentativas restantes em credenciais invalidas', () => {
    const erro: ErroApi = {
      status: 401,
      tipo: 'credenciais-invalidas',
      titulo: 'Não autenticado',
      detalhe: 'E-mail ou senha incorretos.',
      extensoes: { tentativasRestantes: 4 },
    };
    authService.entrar.mockReturnValue(throwError(() => erro));

    submeter('rafael@teste.com', 'senha-errada');

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('E-mail ou senha incorretos.');
    expect(texto).toContain('Restam 4 tentativas antes do bloqueio temporário.');
  });

  it('mostra o detalhe da API quando nao ha extensao de tentativas restantes', () => {
    const erro: ErroApi = {
      status: 500,
      tipo: 'desconhecido',
      titulo: 'Erro inesperado',
      detalhe: 'Algo deu errado. Tente novamente.',
    };
    authService.entrar.mockReturnValue(throwError(() => erro));

    submeter('rafael@teste.com', 'senha-errada');

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Algo deu errado. Tente novamente.');
  });

  it('limpa o erro anterior ao submeter de novo, mesmo que o novo envio nem chegue a API', () => {
    const erro: ErroApi = {
      status: 401,
      tipo: 'credenciais-invalidas',
      titulo: 'Não autenticado',
      detalhe: 'E-mail ou senha incorretos.',
      extensoes: { tentativasRestantes: 4 },
    };
    authService.entrar.mockReturnValue(throwError(() => erro));
    submeter('rafael@teste.com', 'senha-errada');

    fixture.componentInstance['form'].controls.email.setValue('');
    fixture.componentInstance['aoSubmeter']();
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).not.toContain('Restam 4 tentativas');
  });
});
