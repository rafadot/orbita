package com.dot.api.orbita.core.error;

import org.springframework.http.HttpStatus;

public class NaoEncontradoException extends ExcecaoDominio {

    public NaoEncontradoException(String detail) {
        super(HttpStatus.NOT_FOUND, "nao-encontrado", detail);
    }
}
