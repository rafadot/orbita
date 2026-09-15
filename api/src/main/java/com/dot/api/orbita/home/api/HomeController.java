package com.dot.api.orbita.home.api;

import com.dot.api.orbita.core.security.UsuarioAtual;
import com.dot.api.orbita.home.api.dto.ResumoHomeResponse;
import com.dot.api.orbita.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Home", description = "Resumo da tela inicial do usuário autenticado.")
public class HomeController {

    private final HomeService homeService;
    private final UsuarioAtual usuarioAtual;

    @GetMapping("/home")
    @Operation(summary = "Retorna o resumo da tela inicial do usuário autenticado")
    @ApiResponse(responseCode = "200", description = "Resumo da home")
    @ApiResponse(responseCode = "401", description = "Token de acesso ausente, inválido ou expirado")
    public ResumoHomeResponse buscarResumo() {
        return homeService.montarResumo(usuarioAtual.id());
    }
}
