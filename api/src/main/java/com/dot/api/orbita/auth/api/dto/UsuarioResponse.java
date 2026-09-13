package com.dot.api.orbita.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

public record UsuarioResponse(
        @Schema(description = "Identificador do usuário") UUID id,
        @Schema(description = "Nome completo", example = "Rafael Aires") String nome,
        @Schema(description = "E-mail cadastrado", example = "rafael@exemplo.com") String email,
        @Schema(description = "Instante em que o e-mail foi confirmado, ou nulo se ainda não confirmado")
        Instant emailConfirmadoEm,
        @Schema(description = "Instante do cadastro") Instant criadoEm) {
}
