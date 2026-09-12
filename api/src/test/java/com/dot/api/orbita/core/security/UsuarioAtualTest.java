package com.dot.api.orbita.core.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class UsuarioAtualTest {

    private final UsuarioAtual usuarioAtual = new UsuarioAtual();

    @AfterEach
    void limparContextoSeguranca() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deve_retornar_id_do_usuario_quando_principal_e_jwt() {
        UUID id = UUID.randomUUID();
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "HS256")
                .claim("sub", id.toString())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt));

        assertThat(usuarioAtual.id()).isEqualTo(id);
    }

    @Test
    void deve_lancar_excecao_quando_principal_nao_e_jwt() {
        SecurityContextHolder.getContext()
                .setAuthentication(new TestingAuthenticationToken("principal-qualquer", null));

        assertThatThrownBy(usuarioAtual::id).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void deve_lancar_excecao_quando_nao_ha_autenticacao_no_contexto() {
        assertThatThrownBy(usuarioAtual::id).isInstanceOf(IllegalStateException.class);
    }
}
