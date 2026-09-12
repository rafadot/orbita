package com.dot.api.orbita.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * URL do front, usada para montar links enviados por e-mail (confirmação de
 * cadastro, etc.). Separada de {@link AutenticacaoProperties} porque não é
 * um parâmetro de autenticação — é onde o front roda.
 */
@ConfigurationProperties("orbita")
public record FrontendProperties(String frontendUrl) {
}
