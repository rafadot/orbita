import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ErroApi } from '../../../../core/api/erro-api.model';
import { Alerta } from '../../../../shared/ui/alerta/alerta';
import { CampoSenha } from '../../../../shared/ui/campo-senha/campo-senha';
import { Checkbox } from '../../../../shared/ui/checkbox/checkbox';
import { AuthService } from '../../auth.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { ForcaSenha } from '../../components/forca-senha/forca-senha';
import { definirEmailPendente } from '../../email-pendente';
import { aplicarErrosDeCampo } from '../../erros-formulario';
import { calcularForcaSenha, senhaForte } from '../../validators/senha-forte';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink, AuthShell, Alerta, CampoSenha, ForcaSenha, Checkbox],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cadastro {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    nome: this.fb.control('', Validators.required),
    email: this.fb.control('', [Validators.required, Validators.email]),
    senha: this.fb.control('', senhaForte()),
    aceitouTermos: this.fb.control(false, Validators.requiredTrue),
  });

  protected readonly enviando = signal(false);
  protected readonly formSubmetido = signal(false);
  protected readonly sucesso = signal(false);
  protected readonly termosNaoAceitos = signal(false);
  protected readonly erroServidor = signal<ErroApi | null>(null);

  protected campoInvalido(nome: 'nome' | 'email' | 'senha'): boolean {
    const controle = this.form.controls[nome];
    return controle.invalid && (controle.touched || this.formSubmetido());
  }

  protected mensagemNome(): string | undefined {
    const controle = this.form.controls.nome;
    if (controle.errors?.['servidor']) return controle.errors['servidor'] as string;
    if (controle.errors?.['required']) return 'Informe seu nome completo.';
    return undefined;
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
    if (controle.errors?.['required']) return 'Informe uma senha.';
    if (controle.errors?.['senhaFraca']) {
      const forca = calcularForcaSenha(controle.value);
      return forca.nivel === 1
        ? 'Senha muito fraca: evite seu nome e use no mínimo 10 caracteres.'
        : 'Inclua uma letra maiúscula ou número e um símbolo.';
    }
    return undefined;
  }

  protected aoSubmeter(): void {
    this.formSubmetido.set(true);
    this.erroServidor.set(null);
    this.termosNaoAceitos.set(this.form.controls.aceitouTermos.value === false);
    if (this.form.invalid) {
      return;
    }
    this.enviando.set(true);
    const { nome, email, senha, aceitouTermos } = this.form.getRawValue();
    this.authService.cadastrar({ nome, email, senha, aceitouTermos }).subscribe({
      next: () => {
        definirEmailPendente(email);
        this.sucesso.set(true);
        setTimeout(() => this.router.navigateByUrl('/confirmar-email'), 700);
      },
      error: (erro: ErroApi) => {
        this.enviando.set(false);
        this.tratarErro(erro);
      },
    });
  }

  private tratarErro(erro: ErroApi): void {
    if (erro.tipo === 'validacao') {
      aplicarErrosDeCampo(this.form, erro.erros);
      return;
    }
    this.erroServidor.set(erro);
  }
}
