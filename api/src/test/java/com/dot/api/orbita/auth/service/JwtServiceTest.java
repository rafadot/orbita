package com.dot.api.orbita.auth.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.core.config.AutenticacaoProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/**
 * Usa um {@link JwtEncoder}/{@link JwtDecoder} real com segredo fixo — mais
 * barato do que subir contexto Spring e testa as claims de fato.
 */
class JwtServiceTest {

    private static final String SEGREDO = "segredo-de-teste-com-pelo-menos-32-bytes!!";

    private final SecretKeySpec chaveSecreta = new SecretKeySpec(SEGREDO.getBytes(), "HmacSHA256");
    private final JwtEncoder jwtEncoder = new NimbusJwtEncoder(new ImmutableSecret<>(chaveSecreta));
    private final JwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(chaveSecreta)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();

    private final AutenticacaoProperties properties = new AutenticacaoProperties(
            SEGREDO, Duration.ofMinutes(15), Duration.ofDays(1), Duration.ofDays(30),
            Duration.ofMinutes(30), Duration.ofSeconds(60), 5, Duration.ofMinutes(15));

    private final JwtService jwtService = new JwtService(jwtEncoder, properties);

    @Test
    void deve_emitir_token_com_subject_e_claims_corretos_quando_usuario_valido() {
        UUID id = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(id).nome("Rafael").email("rafael@orbita.app").build();

        String tokenValue = jwtService.emitirTokenAcesso(usuario);
        Jwt jwt = jwtDecoder.decode(tokenValue);

        assertThat(jwt.getSubject()).isEqualTo(id.toString());
        assertThat(jwt.getClaimAsString("email")).isEqualTo("rafael@orbita.app");
        assertThat(jwt.getExpiresAt()).isAfter(Instant.now());
        assertThat(jwt.getExpiresAt()).isBeforeOrEqualTo(Instant.now().plus(properties.duracaoTokenAcesso()).plusSeconds(5));
    }

    @Test
    void deve_retornar_duracao_configurada_quando_consultado() {
        assertThat(jwtService.duracaoTokenAcesso()).isEqualTo(Duration.ofMinutes(15));
    }
}
