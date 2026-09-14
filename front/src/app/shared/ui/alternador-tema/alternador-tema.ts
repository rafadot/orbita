import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TemaService } from '../../../core/tema/tema.service';

const DURACAO_PULSO_MS = 620;

/**
 * O símbolo da Órbita (núcleo + 8 satélites) é o próprio botão de troca de
 * tema — um único componente usado em toda tela, pública ou logada (ver
 * `Logo`, que o embute). Hover e pulso de clique só reagem em CSS; aqui só
 * o estado do pulso e o centro do clique (`getBoundingClientRect`), que dá
 * origem à onda em `TemaService.alternarTema`.
 */
@Component({
  selector: 'app-alternador-tema',
  templateUrl: './alternador-tema.html',
  styleUrl: './alternador-tema.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlternadorTema {
  private readonly temaService = inject(TemaService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pulsando = signal(false);
  protected readonly acento = computed(() => this.temaService.acentoPara(this.temaService.tema()));

  private timerPulso?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timerPulso));
  }

  protected aoClicar(): void {
    this.pulsando.set(true);
    clearTimeout(this.timerPulso);
    this.timerPulso = setTimeout(() => this.pulsando.set(false), DURACAO_PULSO_MS);

    const retangulo = this.elementRef.nativeElement.getBoundingClientRect();
    this.temaService.alternarTema(
      retangulo.left + retangulo.width / 2,
      retangulo.top + retangulo.height / 2,
    );
  }
}
