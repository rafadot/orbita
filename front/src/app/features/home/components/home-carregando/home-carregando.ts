import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Skeleton da Home enquanto `GET /home` está em voo (`resumo.isLoading()`).
 * Puramente visual — sem inputs, sem estado.
 */
@Component({
  selector: 'app-home-carregando',
  templateUrl: './home-carregando.html',
  styleUrl: './home-carregando.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCarregando {}
