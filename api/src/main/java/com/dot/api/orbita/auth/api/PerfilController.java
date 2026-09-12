package com.dot.api.orbita.auth.api;

import com.dot.api.orbita.auth.api.dto.UsuarioResponse;
import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.auth.service.AutenticacaoService;
import com.dot.api.orbita.core.security.UsuarioAtual;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PerfilController {

    private final AutenticacaoService autenticacaoService;
    private final UsuarioAtual usuarioAtual;

    @GetMapping("/me")
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
