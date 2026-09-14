import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OndaTema } from './core/tema/onda-tema/onda-tema';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OndaTema],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
