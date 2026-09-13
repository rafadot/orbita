import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Checkbox com marca customizada (usa `formControlName`) — texto vem por
 * projeção de conteúdo para permitir marcação rica (ex.: link de Termos).
 * Extraído de login/cadastro porque os dois repetiam o mesmo CSS.
 */
@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true,
    },
  ],
})
export class Checkbox implements ControlValueAccessor {
  protected readonly marcado = signal(false);
  protected readonly desabilitado = signal(false);

  private aoMudar: (valor: boolean) => void = () => {};
  private aoTocar: () => void = () => {};

  writeValue(valor: boolean): void {
    this.marcado.set(!!valor);
  }

  registerOnChange(fn: (valor: boolean) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected alternar(): void {
    this.marcado.update((atual) => !atual);
    this.aoMudar(this.marcado());
  }

  protected marcarTocado(): void {
    this.aoTocar();
  }
}
