package com.dot.api.orbita.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(
        @Schema(description = "Refresh token da sessão a encerrar") @NotBlank String tokenAtualizacao) {
}
