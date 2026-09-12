package com.dot.api.orbita.auth.api.dto;

public record TokensResponse(
        String tokenAcesso,
        String tipoToken,
        long expiraEm,
        String tokenAtualizacao) {
}
