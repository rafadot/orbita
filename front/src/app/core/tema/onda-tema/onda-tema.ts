import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Tema } from '../tema.model';
import { TemaService } from '../tema.service';

/**
 * Overlay da transição de tema — renderizado uma única vez em `App`
 * (nunca dentro de cada tela). Só lê `TemaService.onda()`; toda decisão de
 * geometria e timing mora no serviço.
 */
@Component({
  selector: 'app-onda-tema',
  templateUrl: './onda-tema.html',
  styleUrl: './onda-tema.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OndaTema {
  private readonly temaService = inject(TemaService);

  protected readonly onda = this.temaService.onda;
  protected readonly duracaoOndaMs = this.temaService.duracaoOndaMs;

  protected acentoPara(tema: Tema): string | undefined {
    return this.temaService.acentoPara(tema);
  }
}
