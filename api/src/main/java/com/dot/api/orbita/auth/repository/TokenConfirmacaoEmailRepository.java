package com.dot.api.orbita.auth.repository;

import com.dot.api.orbita.auth.domain.TokenConfirmacaoEmail;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenConfirmacaoEmailRepository extends JpaRepository<TokenConfirmacaoEmail, UUID> {

    Optional<TokenConfirmacaoEmail> findByTokenHash(String tokenHash);

    boolean existsByUsuarioIdAndCriadoEmAfter(UUID usuarioId, Instant instante);
}
