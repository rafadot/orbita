import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Marca "Órbita" (ícone + nome) usada no topo das telas de autenticação. */
@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {}
