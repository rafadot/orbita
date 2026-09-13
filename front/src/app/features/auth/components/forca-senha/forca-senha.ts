import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { calcularForcaSenha } from '../../validators/senha-forte';

/** Medidor de 4 segmentos (`@include tokens.password-strength`) + rótulo/dica. */
@Component({
  selector: 'app-forca-senha',
  templateUrl: './forca-senha.html',
  styleUrl: './forca-senha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForcaSenha {
  readonly senha = input('');

  protected readonly forca = computed(() => calcularForcaSenha(this.senha()));
}
