package com.dot.api.orbita.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record TokensResponse(
        @Schema(description = "Token JWT de acesso — enviado como `Authorization: Bearer <tokenAcesso>`")
        String tokenAcesso,
        @Schema(description = "Tipo do token de acesso", example = "Bearer") String tipoToken,
        @Schema(description = "Tempo de vida do token de acesso, em segundos", example = "900") long expiraEm,
        @Schema(description = "Refresh token opaco — usado em `POST /auth/renovar` e `POST /auth/logout`")
        String tokenAtualizacao) {
}
