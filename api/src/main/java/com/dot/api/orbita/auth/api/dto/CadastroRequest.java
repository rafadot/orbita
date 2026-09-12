package com.dot.api.orbita.auth.api.dto;

import com.dot.api.orbita.auth.api.validation.SenhaForte;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CadastroRequest(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @SenhaForte String senha,
        @AssertTrue(message = "É necessário aceitar os termos de uso.") boolean aceitouTermos) {
}
