package com.dot.api.orbita.core.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GeradorTokenTest {

    private final GeradorToken geradorToken = new GeradorToken();

    @Test
    void deve_gerar_tokens_diferentes_quando_chamado_duas_vezes() {
        String primeiro = geradorToken.gerar();
        String segundo = geradorToken.gerar();

        assertThat(primeiro).isNotEqualTo(segundo);
        assertThat(primeiro).isNotBlank();
    }

    @Test
    void deve_hashear_de_forma_deterministica_quando_mesmo_token() {
        String token = geradorToken.gerar();

        String hash1 = geradorToken.hashear(token);
        String hash2 = geradorToken.hashear(token);

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).isNotEqualTo(token);
    }

    @Test
    void deve_gerar_hashes_diferentes_quando_tokens_diferentes() {
        String hashA = geradorToken.hashear(geradorToken.gerar());
        String hashB = geradorToken.hashear(geradorToken.gerar());

        assertThat(hashA).isNotEqualTo(hashB);
    }
}
