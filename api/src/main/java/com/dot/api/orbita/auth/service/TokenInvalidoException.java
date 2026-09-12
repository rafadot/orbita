package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.core.error.ExcecaoDominio;
import org.springframework.http.HttpStatus;

public class TokenInvalidoException extends ExcecaoDominio {

    public TokenInvalidoException(String detail) {
        super(HttpStatus.BAD_REQUEST, "token-invalido", detail);
    }
}
