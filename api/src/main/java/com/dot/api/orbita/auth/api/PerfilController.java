package com.dot.api.orbita.auth.api;

import com.dot.api.orbita.auth.api.dto.UsuarioResponse;
import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.auth.service.AutenticacaoService;
import com.dot.api.orbita.core.security.UsuarioAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Perfil", description = "Dados do usuário autenticado.")
public class PerfilController {

    private final AutenticacaoService autenticacaoService;
    private final UsuarioAtual usuarioAtual;

    @GetMapping("/me")
    @Operation(summary = "Retorna o usuário autenticado atual")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário autenticado"),
            @ApiResponse(responseCode = "401", description = "Token de acesso ausente, inválido ou expirado")
    })
    public UsuarioResponse buscarUsuarioAutenticado() {
        Usuario usuario = autenticacaoService.buscarUsuarioAtual(usuarioAtual.id());
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getEmailConfirmadoEm(),
                usuario.getCriadoEm());
    }
}
