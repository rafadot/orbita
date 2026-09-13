package com.dot.api.orbita.core.error;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void deve_traduzir_excecao_dominio_para_problem_detail_quando_tratada() {
        ExcecaoDominio excecao = new ExcecaoDominio(HttpStatus.CONFLICT,
                "conflito", "detalhe", Map.of("chave", "valor")) {
        };

        ResponseEntity<Object> resposta = handler.tratarExcecaoDominio(excecao, requisicaoFalsa());

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        ProblemDetail problemDetail = (ProblemDetail) resposta.getBody();
        assertThat(problemDetail).isNotNull();
        assertThat(problemDetail.getDetail()).isEqualTo("detalhe");
        assertThat(problemDetail.getTitle()).isEqualTo("Conflito");
        assertThat(problemDetail.getType()).isEqualTo(URI.create("https://orbita.app/erros/conflito"));
        assertThat(problemDetail.getProperties()).containsEntry("chave", "valor");
    }

    @Test
    void deve_listar_erros_por_campo_quando_validacao_falha() throws NoSuchMethodException {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "cadastroRequest");
        bindingResult.addError(new FieldError("cadastroRequest", "senha",
                "A senha deve ter ao menos 10 caracteres, incluir maiúscula ou número, e um símbolo."));
        bindingResult.addError(new FieldError("cadastroRequest", "aceitouTermos",
                "É necessário aceitar os termos de uso."));
        MethodArgumentNotValidException excecao = new MethodArgumentNotValidException(metodoFalso(), bindingResult);

        ResponseEntity<Object> resposta = handler.handleMethodArgumentNotValid(
                excecao, HttpHeaders.EMPTY, HttpStatus.BAD_REQUEST, requisicaoFalsa());

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        ProblemDetail problemDetail = (ProblemDetail) resposta.getBody();
        assertThat(problemDetail).isNotNull();
        assertThat(problemDetail.getTitle()).isEqualTo("Requisição inválida");
        assertThat(problemDetail.getType()).isEqualTo(URI.create("https://orbita.app/erros/validacao"));
        Object erros = problemDetail.getProperties().get("erros");
        assertThat(erros).isEqualTo(List.of(
                Map.of("campo", "aceitouTermos", "mensagem", "É necessário aceitar os termos de uso."),
                Map.of("campo", "senha", "mensagem",
                        "A senha deve ter ao menos 10 caracteres, incluir maiúscula ou número, e um símbolo.")));
    }

    @Test
    void deve_traduzir_detail_quando_message_source_configurado() throws NoSuchMethodException {
        handler.setMessageSource(mensagensPtBr());
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "cadastroRequest");
        bindingResult.addError(new FieldError("cadastroRequest", "senha", "mensagem"));
        MethodArgumentNotValidException excecao = new MethodArgumentNotValidException(metodoFalso(), bindingResult);

        ResponseEntity<Object> resposta = handler.handleMethodArgumentNotValid(
                excecao, HttpHeaders.EMPTY, HttpStatus.BAD_REQUEST, requisicaoFalsa());

        ProblemDetail problemDetail = (ProblemDetail) resposta.getBody();
        assertThat(problemDetail).isNotNull();
        assertThat(problemDetail.getDetail()).isEqualTo("Um ou mais campos estão inválidos.");
    }

    @Test
    void deve_traduzir_titulo_quando_erro_nativo_do_mvc() {
        HttpRequestMethodNotSupportedException excecao = new HttpRequestMethodNotSupportedException("GET");

        ResponseEntity<Object> resposta = handler.createResponseEntity(
                excecao.getBody(), HttpHeaders.EMPTY, HttpStatus.METHOD_NOT_ALLOWED, requisicaoFalsa());

        ProblemDetail problemDetail = (ProblemDetail) resposta.getBody();
        assertThat(problemDetail).isNotNull();
        assertThat(problemDetail.getTitle()).isEqualTo("Método não permitido");
    }

    private ResourceBundleMessageSource mensagensPtBr() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }

    private WebRequest requisicaoFalsa() {
        return new ServletWebRequest(new MockHttpServletRequest());
    }

    private MethodParameter metodoFalso() throws NoSuchMethodException {
        return new MethodParameter(GlobalExceptionHandlerTest.class.getDeclaredMethod("alvoFalso", Object.class), 0);
    }

    @SuppressWarnings("unused")
    private void alvoFalso(Object parametro) {
    }
}
