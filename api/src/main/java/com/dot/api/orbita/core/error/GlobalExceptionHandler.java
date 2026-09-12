package com.dot.api.orbita.core.error;

import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Traduz exceções de domínio para {@code application/problem+json} (RFC 9457).
 * Exceções do próprio Spring (validação, parse de JSON, etc.) já são tratadas
 * pelo {@link ResponseEntityExceptionHandler} herdado, com
 * {@code spring.mvc.problemdetails.enabled=true}. Nunca expor stack trace cru.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ExcecaoDominio.class)
    public ResponseEntity<Object> tratarExcecaoDominio(ExcecaoDominio excecao) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(excecao.getStatus(), excecao.getMessage());
        problemDetail.setType(excecao.getType());
        excecao.getExtensions().forEach(problemDetail::setProperty);
        return ResponseEntity.status(excecao.getStatus()).body(problemDetail);
    }
}
