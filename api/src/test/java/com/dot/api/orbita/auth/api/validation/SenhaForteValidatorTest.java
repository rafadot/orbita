package com.dot.api.orbita.auth.api.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class SenhaForteValidatorTest {

    private final SenhaForteValidator validator = new SenhaForteValidator();

    @ParameterizedTest
    @ValueSource(strings = {"Abcdefg1!2", "abcdefghij1!", "SENHA#FORTE1"})
    void deve_aceitar_quando_senha_atende_todos_os_requisitos(String senha) {
        assertThat(validator.isValid(senha, null)).isTrue();
    }

    @Test
    void deve_rejeitar_quando_senha_nula() {
        assertThat(validator.isValid(null, null)).isFalse();
    }

    @Test
    void deve_rejeitar_quando_menor_que_dez_caracteres() {
        assertThat(validator.isValid("Ab1!", null)).isFalse();
    }

    @Test
    void deve_rejeitar_quando_sem_simbolo() {
        assertThat(validator.isValid("Abcdefgh12", null)).isFalse();
    }

    @Test
    void deve_rejeitar_quando_sem_maiuscula_e_sem_numero() {
        assertThat(validator.isValid("abcdefghi!", null)).isFalse();
    }
}
