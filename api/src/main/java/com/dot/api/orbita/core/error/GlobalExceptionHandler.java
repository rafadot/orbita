package com.dot.api.orbita.core.error;

import java.net.URI;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.jspecify.annotations.Nullable;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Traduz exceções de domínio e as exceções nativas do MVC para
 * {@code application/problem+json} (RFC 9457), sempre em pt-BR. Exceções do
 * Spring (validação, parse de JSON, método/mídia não suportados etc.) já são
 * tratadas pelo {@link ResponseEntityExceptionHandler} herdado
 * ({@code spring.mvc.problemdetails.enabled=true}); {@code detail} delas vem
 * de {@code messages.properties} (locale fixo em {@code spring.mvc.locale}).
 * {@link #createResponseEntity} é o funil por onde passa qualquer {@code
 * ProblemDetail} montado pelo pai — é onde o {@code title} em inglês (reason
 * phrase HTTP) é substituído pelo equivalente em pt-BR. Nunca expor stack
 * trace cru.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Map<HttpStatus, String> TITULOS_EM_PORTUGUES = new EnumMap<>(HttpStatus.class);

    static {
        TITULOS_EM_PORTUGUES.put(HttpStatus.BAD_REQUEST, "Requisição inválida");
        TITULOS_EM_PORTUGUES.put(HttpStatus.UNAUTHORIZED, "Não autenticado");
        TITULOS_EM_PORTUGUES.put(HttpStatus.FORBIDDEN, "Acesso negado");
        TITULOS_EM_PORTUGUES.put(HttpStatus.NOT_FOUND, "Não encontrado");
        TITULOS_EM_PORTUGUES.put(HttpStatus.METHOD_NOT_ALLOWED, "Método não permitido");
        TITULOS_EM_PORTUGUES.put(HttpStatus.NOT_ACCEPTABLE, "Formato não aceito");
        TITULOS_EM_PORTUGUES.put(HttpStatus.CONFLICT, "Conflito");
        TITULOS_EM_PORTUGUES.put(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Tipo de conteúdo não suportado");
        TITULOS_EM_PORTUGUES.put(HttpStatus.UNPROCESSABLE_CONTENT, "Não processável");
        TITULOS_EM_PORTUGUES.put(HttpStatus.LOCKED, "Bloqueado");
        TITULOS_EM_PORTUGUES.put(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno");
        TITULOS_EM_PORTUGUES.put(HttpStatus.SERVICE_UNAVAILABLE, "Serviço indisponível");
    }

    @ExceptionHandler(ExcecaoDominio.class)
    public ResponseEntity<Object> tratarExcecaoDominio(ExcecaoDominio excecao, WebRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(excecao.getStatus(), excecao.getMessage());
        problemDetail.setType(excecao.getType());
        excecao.getExtensions().forEach(problemDetail::setProperty);
        return createResponseEntity(problemDetail, HttpHeaders.EMPTY, excecao.getStatus(), request);
    }

    /**
     * Além do {@code detail} traduzido (via {@code messages.properties}),
     * acrescenta a extensão {@code erros}: um item {@code {campo, mensagem}}
     * por violação, ordenado por campo — é o que o front usa pra apontar o
     * problema em cada input. Erro sem campo (validação de classe) entra com
     * o nome do objeto como campo.
     */
    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException excecao, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ProblemDetail problemDetail = excecao.updateAndGetBody(getMessageSource(), LocaleContextHolder.getLocale());
        problemDetail.setType(URI.create(ExcecaoDominio.ERROS_BASE_URI + "validacao"));
        problemDetail.setProperty("erros", listarErrosPorCampo(excecao));
        return handleExceptionInternal(excecao, problemDetail, headers, status, request);
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(
            @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        if (body instanceof ProblemDetail problemDetail) {
            definirTituloEmPortugues(problemDetail);
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }

    private void definirTituloEmPortugues(ProblemDetail problemDetail) {
        HttpStatus status = HttpStatus.resolve(problemDetail.getStatus());
        String titulo = status != null ? TITULOS_EM_PORTUGUES.get(status) : null;
        if (titulo != null) {
            problemDetail.setTitle(titulo);
        }
    }

    private List<Map<String, String>> listarErrosPorCampo(MethodArgumentNotValidException excecao) {
        return excecao.getAllErrors().stream()
                .map(this::paraCampoEMensagem)
                .sorted(Comparator.comparing(erro -> erro.get("campo")))
                .toList();
    }

    private Map<String, String> paraCampoEMensagem(ObjectError erro) {
        String campo = erro instanceof FieldError fieldError ? fieldError.getField() : erro.getObjectName();
        String mensagem = erro.getDefaultMessage() != null ? erro.getDefaultMessage() : "Valor inválido.";
        return Map.of("campo", campo, "mensagem", mensagem);
    }
}
