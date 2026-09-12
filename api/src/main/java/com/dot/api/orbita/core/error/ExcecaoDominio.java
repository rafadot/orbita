package com.dot.api.orbita.core.error;

import java.net.URI;
import java.util.Map;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base de toda exceção de domínio traduzida para {@code application/problem+json}
 * pelo {@link GlobalExceptionHandler}. Nunca deve ser lançada diretamente — só
 * através de uma subclasse com status/type fixos.
 */
@Getter
public abstract class ExcecaoDominio extends RuntimeException {

    protected static final String ERROS_BASE_URI = "https://orbita.app/erros/";

    private final HttpStatus status;
    private final URI type;
    private final transient Map<String, Object> extensions;

    protected ExcecaoDominio(HttpStatus status, String slug, String detail) {
        this(status, slug, detail, Map.of());
    }

    protected ExcecaoDominio(HttpStatus status, String slug, String detail, Map<String, Object> extensions) {
        super(detail);
        this.status = status;
        this.type = URI.create(ERROS_BASE_URI + slug);
        this.extensions = extensions;
    }
}
