package com.dot.api.orbita.core.error;

import org.springframework.http.HttpStatus;

public class ConflitoException extends ExcecaoDominio {

    public ConflitoException(String detail) {
        super(HttpStatus.CONFLICT, "conflito", detail);
    }
}
