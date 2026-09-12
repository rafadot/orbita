package com.dot.api.orbita.auth.api;

import com.dot.api.orbita.auth.api.dto.CadastroRequest;
import com.dot.api.orbita.auth.api.dto.ConfirmarEmailRequest;
import com.dot.api.orbita.auth.api.dto.LoginRequest;
import com.dot.api.orbita.auth.api.dto.LogoutRequest;
import com.dot.api.orbita.auth.api.dto.ReenviarConfirmacaoRequest;
import com.dot.api.orbita.auth.api.dto.RenovarRequest;
import com.dot.api.orbita.auth.api.dto.TokensResponse;
import com.dot.api.orbita.auth.service.AutenticacaoService;
import com.dot.api.orbita.auth.service.CadastroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AutenticacaoController {

    private final CadastroService cadastroService;
    private final AutenticacaoService autenticacaoService;

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public void cadastrar(@Valid @RequestBody CadastroRequest request) {
        cadastroService.cadastrar(request.nome(), request.email(), request.senha(), request.aceitouTermos());
    }

    @PostMapping("/email/confirmar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmarEmail(@Valid @RequestBody ConfirmarEmailRequest request) {
        cadastroService.confirmarEmail(request.token());
    }

    @PostMapping("/email/reenviar")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void reenviarConfirmacao(@Valid @RequestBody ReenviarConfirmacaoRequest request) {
        cadastroService.reenviarConfirmacao(request.email());
    }

    @PostMapping("/login")
    public ResponseEntity<TokensResponse> login(@Valid @RequestBody LoginRequest request) {
        TokensResponse tokens = autenticacaoService.autenticar(
                request.email(), request.senha(), request.manterConectado());
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/renovar")
    public ResponseEntity<TokensResponse> renovar(@Valid @RequestBody RenovarRequest request) {
        TokensResponse tokens = autenticacaoService.renovarTokens(request.tokenAtualizacao());
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody LogoutRequest request) {
        autenticacaoService.sair(request.tokenAtualizacao());
    }
}
