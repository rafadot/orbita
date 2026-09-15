import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Alerta } from '../../../../shared/ui/alerta/alerta';
import { HomeCarregando } from '../../components/home-carregando/home-carregando';
import { PrimeiroAcesso } from '../../components/primeiro-acesso/primeiro-acesso';
import { HomeService } from '../../home.service';

/**
 * Tela inicial pós-login. Hoje só cobre "carregando" e "primeiro acesso" —
 * a variante "completa" (com dados) chega junto do primeiro módulo de vida
 * real (ver `Orbita - Home.dc.html` no Claude Design).
 */
@Component({
  selector: 'app-inicio',
  imports: [Alerta, HomeCarregando, PrimeiroAcesso],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  private readonly homeService = inject(HomeService);

  protected readonly resumo = this.homeService.carregarResumo();
}
