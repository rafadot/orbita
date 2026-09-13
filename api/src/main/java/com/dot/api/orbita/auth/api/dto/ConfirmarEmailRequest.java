package com.dot.api.orbita.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record ConfirmarEmailRequest(
        @Schema(description = "Token recebido no link de confirmação por e-mail — expira em 30 min")
        @NotBlank String token) {
}
