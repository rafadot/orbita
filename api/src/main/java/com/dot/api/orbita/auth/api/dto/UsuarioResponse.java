package com.dot.api.orbita.auth.api.dto;

import java.time.Instant;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String nome,
        String email,
        Instant emailConfirmadoEm,
        Instant criadoEm) {
}
