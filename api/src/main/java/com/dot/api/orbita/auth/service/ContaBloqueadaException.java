package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.core.error.ExcecaoDominio;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;

public class ContaBloqueadaException extends ExcecaoDominio {

    public ContaBloqueadaException(Instant bloqueadoAte) {
        super(HttpStatus.LOCKED,
                "conta-bloqueada",
                "Conta temporariamente bloqueada por excesso de tentativas.",
                Map.of("bloqueadoAte", bloqueadoAte.toString()));
    }
}
