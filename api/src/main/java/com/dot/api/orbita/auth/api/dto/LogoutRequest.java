package com.dot.api.orbita.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(@NotBlank String tokenAtualizacao) {
}
