package com.dot.api.orbita.home.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record ResumoHomeResponse(
        @Schema(description = "Verdadeiro quando o usuário ainda não conectou nenhuma instituição")
        boolean primeiroAcesso) {
}
