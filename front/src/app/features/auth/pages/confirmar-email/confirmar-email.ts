import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErroApi } from '../../../../core/api/erro-api.model';
import { Alerta } from '../../../../shared/ui/alerta/alerta';
import { AuthService } from '../../auth.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import {
  definirEmailPendente,
  limparEmailPendente,
  obterEmailPendente,
} from '../../email-pendente';

type ModoConfirmacao = 'aguardando' | 'confirmando' | 'confirmado' | 'erro-token';

const COOLDOWN_REENVIO_SEGUNDOS = 60;

const WEBMAIL_POR_DOMINIO: Record<string, string> = {
  'gmail.com': 'https://mail.google.com',
  'outlook.com': 'https://outlook.live.com',
  'hotmail.com': 'https://outlook.live.com',
  'live.com': 'https://outlook.live.com',
  'yahoo.com': 'https://mail.yahoo.com',
  'yahoo.com.br': 'https://mail.yahoo.com',
  'icloud.com': 'https://www.icloud.com/mail',
};

/**
 * Duas situações nesta mesma rota: com `?token=` (link clicado no e-mail —
 * confirma direto) ou sem (tela de espera, com reenvio). O link de
 * confirmação aponta pra cá porque a API já fixa essa rota (ver
 * `EmailConfirmacaoComposer` em `api/CLAUDE.md`).
 */
@Component({
  selector: 'app-confirmar-email',
  imports: [ReactiveFormsModule, RouterLink, AuthShell, Alerta],
  templateUrl: './confirmar-email.html',
  styleUrl: './confirmar-email.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmarEmail implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly token = input<string>();

  protected readonly modo = signal<ModoConfirmacao>('aguardando');
  protected readonly email = signal<string | null>(null);
  protected readonly reenviando = signal(false);
  protected readonly reenviado = signal(false);
  protected readonly segundosRestantes = signal(0);
  protected readonly erroServidor = signal<ErroApi | null>(null);

  protected readonly formEmail = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  private intervaloContador?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const token = this.token();
    if (token) {
      this.confirmarToken(token);
    } else {
      this.email.set(obterEmailPendente());
      this.iniciarContador();
    }
  }

  protected contadorFormatado(): string {
    const total = this.segundosRestantes();
    const minutos = Math.floor(total / 60);
    const segundos = total % 60;
    return `${minutos}:${String(segundos).padStart(2, '0')}`;
  }

  protected linkWebmail(): string | null {
    const dominio = this.email()?.split('@')[1]?.toLowerCase();
    return dominio ? (WEBMAIL_POR_DOMINIO[dominio] ?? null) : null;
  }

  protected reenviarComEmailAtual(): void {
    const emailAlvo = this.email();
    if (emailAlvo) {
      this.reenviar(emailAlvo);
    }
  }

  protected aoSubmeterEmail(): void {
    if (this.formEmail.invalid) {
      this.formEmail.markAllAsTouched();
      return;
    }
    this.reenviar(this.formEmail.controls.email.value);
  }

  protected usarOutroEmail(): void {
    limparEmailPendente();
    this.email.set(null);
    this.reenviado.set(false);
    this.pararContador();
  }

  private reenviar(emailAlvo: string): void {
    this.reenviando.set(true);
    this.reenviado.set(false);
    this.erroServidor.set(null);
    this.authService.reenviarConfirmacao(emailAlvo).subscribe({
      next: () => {
        this.reenviando.set(false);
        this.reenviado.set(true);
        this.email.set(emailAlvo);
        definirEmailPendente(emailAlvo);
        this.iniciarContador();
      },
      error: (erro: ErroApi) => {
        this.reenviando.set(false);
        this.erroServidor.set(erro);
      },
    });
  }

  private confirmarToken(token: string): void {
    this.modo.set('confirmando');
    this.erroServidor.set(null);
    this.authService.confirmarEmail(token).subscribe({
      next: () => {
        this.modo.set('confirmado');
        limparEmailPendente();
      },
      error: (erro: ErroApi) => {
        this.erroServidor.set(erro);
        this.modo.set('erro-token');
      },
    });
  }

  private iniciarContador(): void {
    this.pararContador();
    this.segundosRestantes.set(COOLDOWN_REENVIO_SEGUNDOS);
    this.intervaloContador = setInterval(() => {
      this.segundosRestantes.update((atual) => Math.max(atual - 1, 0));
      if (this.segundosRestantes() === 0) {
        this.pararContador();
      }
    }, 1000);
    this.destroyRef.onDestroy(() => this.pararContador());
  }

  private pararContador(): void {
    if (this.intervaloContador !== undefined) {
      clearInterval(this.intervaloContador);
      this.intervaloContador = undefined;
    }
  }
}
