package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.core.error.ExcecaoDominio;
import java.util.Map;
import org.springframework.http.HttpStatus;

public class CredenciaisInvalidasException extends ExcecaoDominio {

    public CredenciaisInvalidasException(int tentativasRestantes) {
        super(HttpStatus.UNAUTHORIZED,
                "credenciais-invalidas",
                "E-mail ou senha incorretos.",
                Map.of("tentativasRestantes", tentativasRestantes));
    }
}
