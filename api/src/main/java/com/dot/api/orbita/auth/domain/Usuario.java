package com.dot.api.orbita.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Exceção à regra "toda tabela tem user_id" — este É o usuário (ver
 * {@code api-migrations.md}). {@code @NoArgsConstructor} é exigido pelo JPA;
 * {@code @AllArgsConstructor} privado é o construtor usado pelo
 * {@code @Builder}. {@code @Setter} existe porque a entidade não guarda
 * regra de negócio — quem decide quando/por que mudar o estado é o service
 * (ver {@code auth/CLAUDE.md}).
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@Builder(toBuilder = true)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Usuario {

    @Id
    private UUID id;

    private String nome;

    private String email;

    @Column(name = "senha_hash")
    private String senhaHash;

    @Column(name = "email_confirmado_em")
    private Instant emailConfirmadoEm;

    @Column(name = "termos_aceitos_em")
    private Instant termosAceitosEm;

    @Column(name = "tentativas_login_falhas")
    private int tentativasLoginFalhas;

    @Column(name = "bloqueado_ate")
    private Instant bloqueadoAte;

    @Column(name = "criado_em")
    private Instant criadoEm;

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    public boolean emailConfirmado() {
        return emailConfirmadoEm != null;
    }

    public boolean bloqueado(Instant agora) {
        return bloqueadoAte != null && bloqueadoAte.isAfter(agora);
    }
}
