import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlternadorTema } from '../alternador-tema/alternador-tema';

/**
 * Marca "Órbita" (ícone + nome) usada no topo de toda tela, pública ou
 * logada. O ícone é o `AlternadorTema` — o mesmo símbolo funciona como
 * botão de troca de tema em qualquer lugar que use `Logo`.
 */
@Component({
  selector: 'app-logo',
  imports: [AlternadorTema],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {}
