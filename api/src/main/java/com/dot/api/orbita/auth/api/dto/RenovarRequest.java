package com.dot.api.orbita.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record RenovarRequest(
        @Schema(description = "Refresh token válido — é rotacionado a cada uso")
        @NotBlank String tokenAtualizacao) {
}
