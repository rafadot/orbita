import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TomAlerta = 'danger' | 'success' | 'warning' | 'info';

/**
 * Caixa de mensagem (erro de servidor, aviso, sucesso) — `@include
 * tokens.alert-base`. `titulo` é opcional (o protótipo usa alertas de
 * sucesso só com uma linha, sem título); `compacto` é a variante menor
 * usada no aviso de "aceite os termos".
 */
@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.html',
  styleUrl: './alerta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alerta {
  readonly tom = input.required<TomAlerta>();
  readonly titulo = input<string>();
  readonly compacto = input(false);
}
