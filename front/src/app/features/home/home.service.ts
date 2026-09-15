import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResumoHome } from './home.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  /** `isLoading()` alimenta o skeleton; `error()` o estado de falha; `value()` decide a variante. */
  carregarResumo() {
    return httpResource<ResumoHome>(() => `${environment.apiUrl}/home`);
  }
}
