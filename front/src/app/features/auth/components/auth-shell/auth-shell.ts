import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Logo } from '../../../../shared/ui/logo/logo';

interface ItemAside {
  numero: string;
  texto: string;
}

/**
 * Layout comum das telas de autenticação (`@include tokens.auth-shell`):
 * coluna do formulário (logo + conteúdo + rodapé) e aside com contexto —
 * some no mobile. Conteúdo e rodapé são projetados (`conteudo`/`rodape`);
 * o texto do aside vem por input porque é dado simples, não markup.
 */
@Component({
  selector: 'app-auth-shell',
  imports: [Logo],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShell {
  readonly asideHeadline = input.required<string>();
  readonly asideTexto = input.required<string>();
  readonly asideLista = input<string[]>([]);

  protected readonly itensAside = computed<ItemAside[]>(() =>
    this.asideLista().map((texto, indice) => ({
      numero: String(indice + 1).padStart(2, '0'),
      texto,
    })),
  );
}
