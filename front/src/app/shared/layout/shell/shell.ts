import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessaoService } from '../../../core/auth/sessao.service';
import { AlternadorTema } from '../../ui/alternador-tema/alternador-tema';
import { AREAS } from '../areas';
import { formatarDataCurta, formatarDataLonga, saudacaoPorHora } from '../cabecalho';

/**
 * Layout comum a toda tela logada — sidebar de ícones (desktop) ou barra
 * inferior (mobile), topbar com saudação/busca/registrar, e o menu do
 * avatar (único lugar de "Sair"). Rota-pai de `home` e dos módulos de vida
 * futuros, atrás de `autenticadoGuard`. Ver `Orbita - Home.dc.html` no
 * Claude Design — projeto `9f402f22…`.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AlternadorTema],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly sessaoService = inject(SessaoService);
  private readonly router = inject(Router);

  protected readonly areas = AREAS;
  protected readonly usuario = this.sessaoService.usuario;
  protected readonly menuAberto = signal(false);

  private readonly agora = new Date();

  protected readonly saudacao = computed(() => saudacaoPorHora(this.agora));
  protected readonly dataLonga = computed(() => formatarDataLonga(this.agora));
  protected readonly dataCurta = computed(() => formatarDataCurta(this.agora));

  protected readonly primeiroNome = computed(() => this.usuario()?.nome.split(' ')[0] ?? '');
  protected readonly inicialAvatar = computed(() =>
    (this.usuario()?.nome.charAt(0) ?? '?').toUpperCase(),
  );

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }

  protected sair(): void {
    this.fecharMenu();
    this.sessaoService.sair().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
