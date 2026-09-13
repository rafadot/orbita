package com.dot.api.orbita.auth.api.dto;

import com.dot.api.orbita.auth.api.validation.SenhaForte;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CadastroRequest(
        @Schema(description = "Nome completo", example = "Rafael Aires") @NotBlank String nome,
        @Schema(description = "E-mail — vira o identificador de login", example = "rafael@exemplo.com")
        @NotBlank @Email String email,
        @Schema(description = "Mínimo 10 caracteres, maiúscula ou número, e um símbolo", example = "Senha#Forte10")
        @SenhaForte String senha,
        @Schema(description = "Aceite dos termos de uso — obrigatoriamente true", example = "true")
        @AssertTrue(message = "É necessário aceitar os termos de uso.") boolean aceitouTermos) {
}
