import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokensResponse } from '../../core/auth/sessao.model';
import { CadastroRequest, LoginRequest } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  entrar(request: LoginRequest): Observable<TokensResponse> {
    return this.http.post<TokensResponse>(`${this.baseUrl}/login`, request);
  }

  cadastrar(request: CadastroRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/cadastro`, request);
  }

  confirmarEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/email/confirmar`, { token });
  }

  reenviarConfirmacao(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/email/reenviar`, { email });
  }
}
