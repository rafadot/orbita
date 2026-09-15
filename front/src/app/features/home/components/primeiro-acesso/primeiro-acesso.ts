import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SessaoService } from '../../../../core/auth/sessao.service';

interface AreaPrimeiroAcesso {
  readonly rotulo: string;
  readonly descricao: string;
  readonly ativa: boolean;
}

/**
 * Áreas na ordem de destaque do primeiro acesso (ativas primeiro) — diferente
 * da ordem de navegação da sidebar (`shared/layout/areas.ts`), por isso não
 * reaproveita `AREAS` daqui.
 */
const AREAS_PRIMEIRO_ACESSO: readonly AreaPrimeiroAcesso[] = [
  { rotulo: 'Finanças', descricao: 'Disponível agora', ativa: true },
  { rotulo: 'Agenda', descricao: 'Sincroniza seu calendário', ativa: true },
  { rotulo: 'Tarefas', descricao: 'Comece com uma lista', ativa: true },
  { rotulo: 'Metas', descricao: 'Ligada às suas contas', ativa: true },
  { rotulo: 'Saúde', descricao: 'Ative quando quiser', ativa: false },
  { rotulo: 'Hábitos', descricao: 'Ative quando quiser', ativa: false },
  { rotulo: 'Documentos', descricao: 'Ative quando quiser', ativa: false },
  { rotulo: 'Carreira', descricao: 'Ative quando quiser', ativa: false },
];

/**
 * Estado "primeiro acesso" da Home — nenhuma instituição conectada ainda.
 * "Conectar meu banco" e "Lançar manualmente" ficam desabilitados até o
 * módulo `financas` existir (ver `Orbita - Home.dc.html` no Claude Design).
 */
@Component({
  selector: 'app-primeiro-acesso',
  templateUrl: './primeiro-acesso.html',
  styleUrl: './primeiro-acesso.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeiroAcesso {
  private readonly sessaoService = inject(SessaoService);

  protected readonly areas = AREAS_PRIMEIRO_ACESSO;
  protected readonly areasInativas = computed(() => this.areas.filter((area) => !area.ativa));

  protected readonly emailConfirmado = computed(
    () => this.sessaoService.usuario()?.emailConfirmadoEm != null,
  );
}
