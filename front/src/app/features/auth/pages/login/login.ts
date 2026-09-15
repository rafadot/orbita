import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErroApi } from '../../../../core/api/erro-api.model';
import { SessaoService } from '../../../../core/auth/sessao.service';
import { Alerta } from '../../../../shared/ui/alerta/alerta';
import { CampoSenha } from '../../../../shared/ui/campo-senha/campo-senha';
import { Checkbox } from '../../../../shared/ui/checkbox/checkbox';
import { AuthService } from '../../auth.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { definirEmailPendente } from '../../email-pendente';
import { aplicarErrosDeCampo, formatarHorario } from '../../erros-formulario';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthShell, Alerta, CampoSenha, Checkbox],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sessaoService = inject(SessaoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    senha: this.fb.control('', Validators.required),
    manterConectado: this.fb.control(true),
  });

  protected readonly enviando = signal(false);
  protected readonly formSubmetido = signal(false);
  protected readonly sucesso = signal(false);
  protected readonly erroServidor = signal<ErroApi | null>(null);
  protected readonly mensagemSecundaria = signal<string | undefined>(undefined);

  protected campoInvalido(nome: 'email' | 'senha'): boolean {
    const controle = this.form.controls[nome];
    return controle.invalid && (controle.touched || this.formSubmetido());
  }

  protected mensagemEmail(): string | undefined {
    const controle = this.form.controls.email;
    if (controle.errors?.['servidor']) return controle.errors['servidor'] as string;
    if (controle.errors?.['required']) return 'Informe seu e-mail.';
    if (controle.errors?.['email']) return 'Digite um e-mail válido, como nome@dominio.com';
    return undefined;
  }

  protected mensagemSenha(): string | undefined {
    const controle = this.form.controls.senha;
    if (controle.errors?.['servidor']) return controle.errors['servidor'] as string;
    if (controle.errors?.['required']) return 'Informe sua senha.';
    return undefined;
  }

  protected aoSubmeter(): void {
    this.formSubmetido.set(true);
    this.erroServidor.set(null);
    this.mensagemSecundaria.set(undefined);
    if (this.form.invalid) {
      return;
    }
    this.enviando.set(true);
    const { email, senha, manterConectado } = this.form.getRawValue();
    this.authService.entrar({ email, senha, manterConectado }).subscribe({
      next: (tokens) => {
        this.sucesso.set(true);
        this.sessaoService.aposAutenticar(tokens, manterConectado).subscribe({
          next: () => this.irParaDestinoAposSucesso(),
          error: () => this.irParaDestinoAposSucesso(),
        });
      },
      error: (erro: ErroApi) => {
        this.enviando.set(false);
        this.tratarErro(erro, email);
      },
    });
  }

  private tratarErro(erro: ErroApi, email: string): void {
    switch (erro.tipo) {
      case 'credenciais-invalidas': {
        const restantes = erro.extensoes?.['tentativasRestantes'] as number | undefined;
        this.mensagemSecundaria.set(
          restantes === undefined
            ? undefined
            : restantes === 1
              ? 'Resta 1 tentativa antes do bloqueio temporário.'
              : `Restam ${restantes} tentativas antes do bloqueio temporário.`,
        );
        this.erroServidor.set(erro);
        break;
      }
      case 'conta-bloqueada': {
        const bloqueadoAte = erro.extensoes?.['bloqueadoAte'] as string | undefined;
        this.mensagemSecundaria.set(
          bloqueadoAte ? `Tente novamente às ${formatarHorario(bloqueadoAte)}.` : undefined,
        );
        this.erroServidor.set(erro);
        break;
      }
      case 'email-nao-verificado':
        definirEmailPendente(email);
        this.router.navigate(['/confirmar-email']);
        break;
      case 'validacao':
        aplicarErrosDeCampo(this.form, erro.erros);
        break;
      default:
        this.erroServidor.set(erro);
    }
  }

  private irParaDestinoAposSucesso(): void {
    const destino = this.route.snapshot.queryParamMap.get('retorno') ?? '/home';
    setTimeout(() => this.router.navigateByUrl(destino), 400);
  }
}
