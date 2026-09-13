import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  guardarTokens,
  limparTokens,
  obterTokenAcesso,
  obterTokenAtualizacao,
  sessaoEhPersistente,
} from './armazenamento-sessao';
import { TokensResponse } from './sessao.model';
import { Usuario } from './usuario.model';

export type EstadoSessao = 'carregando' | 'autenticado' | 'anonimo';

/**
 * Única fonte do estado de sessão no front. Os tokens em si vivem em
 * `localStorage`/`sessionStorage` (ver `armazenamento-sessao.ts`), nunca
 * neste serviço. `estado` começa em `carregando` até `restaurar()`
 * (chamado no bootstrap via `provideAppInitializer`) resolver.
 */
@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly http = inject(HttpClient);

  readonly usuario = signal<Usuario | null>(null);
  readonly estado = signal<EstadoSessao>('carregando');

  private renovacaoEmVoo: Observable<TokensResponse> | null = null;
  private timerRenovacaoProativa: ReturnType<typeof setTimeout> | undefined;

  /**
   * Chamado uma vez no bootstrap — nunca deixa `estado` preso em
   * `carregando`. Sem token nenhum guardado, nem tenta `GET /me`: visitante
   * anônimo não deve gerar requisição alguma na primeira tela.
   */
  restaurar(): Observable<unknown> {
    if (!obterTokenAcesso() && !obterTokenAtualizacao()) {
      this.estado.set('anonimo');
      return of(null);
    }
    return this.carregarUsuario().pipe(catchError(() => of(null)));
  }

  carregarUsuario(): Observable<Usuario> {
    return this.http.get<Usuario>(`${environment.apiUrl}/me`).pipe(
      tap({
        next: (usuario) => {
          this.usuario.set(usuario);
          this.estado.set('autenticado');
        },
        error: () => this.encerrarLocal(),
      }),
    );
  }

  /** Chamado após login/confirmação bem-sucedidos — guarda os tokens, agenda a renovação proativa e carrega o usuário. */
  aposAutenticar(tokens: TokensResponse, manterConectado: boolean): Observable<Usuario> {
    guardarTokens(tokens, manterConectado);
    this.agendarRenovacaoProativa(tokens.expiraEm);
    return this.carregarUsuario();
  }

  /**
   * Troca o refresh token guardado por uma sessão nova. Compartilhada entre
   * chamadores concorrentes (ex.: várias requisições 401 ao mesmo tempo no
   * `renovarSessaoInterceptor`) — só uma chamada de rede está em voo.
   */
  renovar(): Observable<TokensResponse> {
    if (!this.renovacaoEmVoo) {
      const persistente = sessaoEhPersistente();
      this.renovacaoEmVoo = this.http
        .post<TokensResponse>(`${environment.apiUrl}/auth/renovar`, {
          tokenAtualizacao: obterTokenAtualizacao(),
        })
        .pipe(
          tap((tokens) => {
            guardarTokens(tokens, persistente);
            this.agendarRenovacaoProativa(tokens.expiraEm);
          }),
          finalize(() => (this.renovacaoEmVoo = null)),
          shareReplay(1),
        );
    }
    return this.renovacaoEmVoo;
  }

  sair(): Observable<unknown> {
    const tokenAtualizacao = obterTokenAtualizacao();
    if (!tokenAtualizacao) {
      this.encerrarLocal();
      return of(null);
    }
    return this.http
      .post(`${environment.apiUrl}/auth/logout`, { tokenAtualizacao })
      .pipe(finalize(() => this.encerrarLocal()));
  }

  /** Limpa o estado local sem chamar a API — usado quando a renovação falha. */
  encerrarLocal(): void {
    this.usuario.set(null);
    this.estado.set('anonimo');
    this.pararRenovacaoProativa();
    limparTokens();
  }

  private agendarRenovacaoProativa(expiraEmSegundos: number): void {
    this.pararRenovacaoProativa();
    const antecedenciaMs = 60_000;
    const atrasoMs = Math.max(expiraEmSegundos * 1000 - antecedenciaMs, 5_000);
    this.timerRenovacaoProativa = setTimeout(() => {
      this.renovar().subscribe({ error: () => this.encerrarLocal() });
    }, atrasoMs);
  }

  private pararRenovacaoProativa(): void {
    if (this.timerRenovacaoProativa !== undefined) {
      clearTimeout(this.timerRenovacaoProativa);
      this.timerRenovacaoProativa = undefined;
    }
  }
}
