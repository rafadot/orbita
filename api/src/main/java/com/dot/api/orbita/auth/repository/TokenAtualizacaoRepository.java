package com.dot.api.orbita.auth.repository;

import com.dot.api.orbita.auth.domain.TokenAtualizacao;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TokenAtualizacaoRepository extends JpaRepository<TokenAtualizacao, UUID> {

    Optional<TokenAtualizacao> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update TokenAtualizacao t set t.revogadoEm = :agora where t.usuarioId = :usuarioId and t.revogadoEm is null")
    void revogarTodosDoUsuario(@Param("usuarioId") UUID usuarioId, @Param("agora") Instant agora);
}
