import { FormGroup } from '@angular/forms';
import { ErroDeCampo } from '../../core/api/erro-api.model';

/**
 * Aplica um `400` de validação (`erros: [{campo, mensagem}]`, ver
 * `api/CLAUDE.md`) nos controles do formulário — cada mensagem some assim
 * que o campo for editado de novo (comportamento padrão do `Validators`).
 */
export function aplicarErrosDeCampo(form: FormGroup, erros: ErroDeCampo[] | undefined): void {
  erros?.forEach(({ campo, mensagem }) => {
    const controle = form.get(campo);
    if (controle) {
      controle.setErrors({ ...controle.errors, servidor: mensagem });
      controle.markAsTouched();
    }
  });
}

export function formatarHorario(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
}
