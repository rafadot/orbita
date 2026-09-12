package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.core.config.AutenticacaoProperties;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final AutenticacaoProperties autenticacaoProperties;

    public String emitirTokenAcesso(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("orbita")
                .issuedAt(agora)
                .expiresAt(agora.plus(autenticacaoProperties.duracaoTokenAcesso()))
                .subject(usuario.getId().toString())
                .claim("email", usuario.getEmail())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public Duration duracaoTokenAcesso() {
        return autenticacaoProperties.duracaoTokenAcesso();
    }
}
