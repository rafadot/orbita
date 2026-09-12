package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.core.error.ExcecaoDominio;
import org.springframework.http.HttpStatus;

public class EmailNaoVerificadoException extends ExcecaoDominio {

    public EmailNaoVerificadoException() {
        super(HttpStatus.FORBIDDEN,
                "email-nao-verificado",
                "Confirme seu e-mail antes de entrar.");
    }
}
