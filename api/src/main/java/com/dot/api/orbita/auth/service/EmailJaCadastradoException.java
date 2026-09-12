package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.core.error.ExcecaoDominio;
import org.springframework.http.HttpStatus;

public class EmailJaCadastradoException extends ExcecaoDominio {

    public EmailJaCadastradoException() {
        super(HttpStatus.CONFLICT,
                "email-ja-cadastrado",
                "Este e-mail já está cadastrado.");
    }
}
