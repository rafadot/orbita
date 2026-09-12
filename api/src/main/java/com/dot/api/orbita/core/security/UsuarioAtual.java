package com.dot.api.orbita.core.security;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Única fonte do usuário autenticado na requisição atual. Nenhum controller
 * ou service deve ler o JWT diretamente do SecurityContext.
 */
@Component
public class UsuarioAtual {

    public UUID id() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt && jwt.getSubject() != null) {
            return UUID.fromString(jwt.getSubject());
        }
        throw new IllegalStateException("Nenhum usuário autenticado na requisição atual.");
    }
}
