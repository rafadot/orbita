package com.dot.api.orbita.core.error;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void deve_traduzir_excecao_dominio_para_problem_detail_quando_tratada() {
        ExcecaoDominio excecao = new ExcecaoDominio(HttpStatus.CONFLICT,
                "conflito", "detalhe", Map.of("chave", "valor")) {
        };

        ResponseEntity<Object> resposta = handler.tratarExcecaoDominio(excecao);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ProblemDetail problemDetail = (ProblemDetail) resposta.getBody();
        assertThat(problemDetail).isNotNull();
        assertThat(problemDetail.getDetail()).isEqualTo("detalhe");
        assertThat(problemDetail.getType()).isEqualTo(URI.create("https://orbita.app/erros/conflito"));
        assertThat(problemDetail.getProperties()).containsEntry("chave", "valor");
    }
}
