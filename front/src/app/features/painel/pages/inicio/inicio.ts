import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessaoService } from '../../../../core/auth/sessao.service';
import { Logo } from '../../../../shared/ui/logo/logo';

/**
 * Placeholder do destino pós-login — substituído quando existir o primeiro
 * módulo real de vida (finanças, agenda...). Só prova que `GET /me` e
 * `sair()` funcionam de ponta a ponta.
 */
@Component({
  selector: 'app-inicio',
  imports: [Logo],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  private readonly sessaoService = inject(SessaoService);
  private readonly router = inject(Router);

  protected readonly usuario = this.sessaoService.usuario;

  protected sair(): void {
    this.sessaoService.sair().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
