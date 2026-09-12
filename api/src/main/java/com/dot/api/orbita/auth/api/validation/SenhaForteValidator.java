package com.dot.api.orbita.auth.api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Regra de senha do protótipo (ver {@code api-auth.md}): mín. 10 caracteres,
 * maiúscula ou número, e um símbolo. Histórico das 3 últimas senhas fica
 * para a rodada de redefinição de senha.
 */
public class SenhaForteValidator implements ConstraintValidator<SenhaForte, String> {

    private static final int TAMANHO_MINIMO = 10;

    @Override
    public boolean isValid(String senha, ConstraintValidatorContext context) {
        if (senha == null || senha.length() < TAMANHO_MINIMO) {
            return false;
        }
        boolean temMaiusculaOuNumero = senha.chars()
                .anyMatch(caractere -> Character.isUpperCase(caractere) || Character.isDigit(caractere));
        boolean temSimbolo = senha.chars().anyMatch(caractere -> !Character.isLetterOrDigit(caractere));
        return temMaiusculaOuNumero && temSimbolo;
    }
}
