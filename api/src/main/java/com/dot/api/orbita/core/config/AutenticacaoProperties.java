package com.dot.api.orbita.core.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Todos os TTLs e limites de autenticação — nenhum número mágico no código.
 * Ver {@code application.properties} (prefixo {@code orbita.auth}).
 */
@ConfigurationProperties("orbita.auth")
public record AutenticacaoProperties(
        String jwtSecret,
        Duration duracaoTokenAcesso,
        Duration duracaoTokenAtualizacao,
        Duration duracaoTokenAtualizacaoMantendoConectado,
        Duration duracaoConfirmacaoEmail,
        Duration intervaloMinimoReenvioEmail,
        int numeroMaximoTentativasLogin,
        Duration duracaoBloqueioLogin) {
}
