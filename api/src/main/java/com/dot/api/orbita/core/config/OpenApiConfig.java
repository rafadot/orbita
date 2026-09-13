package com.dot.api.orbita.core.config;

import io.swagger.v3.core.converter.AnnotatedType;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.core.converter.ResolvedSchema;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ProblemDetail;

/**
 * Documentação OpenAPI (springdoc) — ver ADR 0007. Os beans sempre existem;
 * quem liga ou desliga a exposição de fato é
 * {@code springdoc.api-docs.enabled}/{@code springdoc.swagger-ui.enabled}
 * (só {@code true} em {@code application-local.properties}).
 */
@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA_TOKEN_ACESSO = "tokenAcesso";

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Orbita API")
                        .description("API pessoal do Orbita — gestão modular da vida do usuário autenticado.")
                        .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_TOKEN_ACESSO))
                .components(new Components().addSecuritySchemes(ESQUEMA_TOKEN_ACESSO,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    /**
     * Toda resposta documentada com status de erro (4xx/5xx) e sem corpo
     * próprio herda o schema de {@link ProblemDetail} como
     * {@code application/problem+json} — evita repetir esse par em cada
     * {@code @ApiResponse} dos controllers (ver
     * {@code core/error/GlobalExceptionHandler}).
     */
    @Bean
    public OpenApiCustomizer respostasDeErroComoProblemDetail() {
        return openApi -> {
            registrarSchemaProblemDetail(openApi);
            openApi.getPaths().values().forEach(pathItem -> pathItem.readOperations()
                    .forEach(operation -> preencherRespostasDeErroSemCorpo(operation.getResponses())));
        };
    }

    private void registrarSchemaProblemDetail(OpenAPI openApi) {
        ResolvedSchema schemaResolvido = ModelConverters.getInstance()
                .resolveAsResolvedSchema(new AnnotatedType(ProblemDetail.class));
        schemaResolvido.referencedSchemas.forEach(openApi.getComponents()::addSchemas);
        openApi.getComponents().addSchemas("ProblemDetail", schemaResolvido.schema);
    }

    private void preencherRespostasDeErroSemCorpo(ApiResponses respostas) {
        if (respostas == null) {
            return;
        }
        respostas.forEach((codigoStatus, resposta) -> {
            if (indicaErro(codigoStatus) && semCorpoDocumentado(resposta)) {
                resposta.setContent(construirConteudoProblemDetail());
            }
        });
    }

    private boolean indicaErro(String codigoStatus) {
        return codigoStatus.length() == 3 && (codigoStatus.charAt(0) == '4' || codigoStatus.charAt(0) == '5');
    }

    private boolean semCorpoDocumentado(ApiResponse resposta) {
        return resposta.getContent() == null || resposta.getContent().isEmpty();
    }

    private Content construirConteudoProblemDetail() {
        return new Content().addMediaType("application/problem+json",
                new MediaType().schema(new Schema<>().$ref("#/components/schemas/ProblemDetail")));
    }
}
