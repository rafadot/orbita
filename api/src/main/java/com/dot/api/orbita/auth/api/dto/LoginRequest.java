package com.dot.api.orbita.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(description = "E-mail cadastrado", example = "rafael@exemplo.com") @NotBlank @Email String email,
        @Schema(description = "Senha em texto puro — nunca logada nem persistida", example = "Senha#Forte10")
        @NotBlank String senha,
        @Schema(description = "Se true, o refresh token dura 30 dias em vez de 1 dia", example = "false")
        boolean manterConectado) {
}
