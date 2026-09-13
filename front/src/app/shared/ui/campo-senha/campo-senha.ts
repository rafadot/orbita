import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Input de senha com alternância "ver"/"ocultar" (`ControlValueAccessor`,
 * usa com `formControlName` normalmente). `idCampo` liga o `<label for>`
 * externo; `descritoPor` liga a mensagem de erro externa via
 * `aria-describedby`.
 */
@Component({
  selector: 'app-campo-senha',
  templateUrl: './campo-senha.html',
  styleUrl: './campo-senha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoSenha),
      multi: true,
    },
  ],
})
export class CampoSenha implements ControlValueAccessor {
  readonly idCampo = input.required<string>();
  readonly autocomplete = input('current-password');
  readonly invalido = input(false);
  readonly descritoPor = input<string>();

  protected readonly valor = signal('');
  protected readonly visivel = signal(false);
  protected readonly desabilitado = signal(false);

  private aoMudar: (valor: string) => void = () => {};
  private aoTocar: () => void = () => {};

  writeValue(valor: string): void {
    this.valor.set(valor ?? '');
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected aoDigitar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.valor.set(valor);
    this.aoMudar(valor);
  }

  protected aoTocarCampo(): void {
    this.aoTocar();
  }

  protected alternarVisibilidade(): void {
    this.visivel.update((atual) => !atual);
  }
}
