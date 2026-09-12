package com.dot.api.orbita.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ReenviarConfirmacaoRequest(@NotBlank @Email String email) {
}
