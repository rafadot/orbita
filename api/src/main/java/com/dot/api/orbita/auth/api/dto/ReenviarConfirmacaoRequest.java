package com.dot.api.orbita.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ReenviarConfirmacaoRequest(
        @Schema(description = "E-mail cadastrado — resposta é sempre 202, mesmo se não existir", example = "rafael@exemplo.com")
        @NotBlank @Email String email) {
}
