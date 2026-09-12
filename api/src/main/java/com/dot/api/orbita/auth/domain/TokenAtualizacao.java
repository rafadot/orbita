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

@Entity
@Table(name = "tokens_atualizacao")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class TokenAtualizacao {

    @Id
    private UUID id;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "token_hash")
    private String tokenHash;

    @Column(name = "expira_em")
    private Instant expiraEm;

    @Column(name = "revogado_em")
    private Instant revogadoEm;

    private boolean persistente;

    @Column(name = "criado_em")
    private Instant criadoEm;

    public boolean valido(Instant agora) {
        return revogadoEm == null && expiraEm.isAfter(agora);
    }
}
