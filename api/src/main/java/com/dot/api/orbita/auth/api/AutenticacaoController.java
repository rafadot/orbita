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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Autenticação", description = "Cadastro, confirmação de e-mail, login, refresh e logout.")
@SecurityRequirements
public class AutenticacaoController {

    private final CadastroService cadastroService;
    private final AutenticacaoService autenticacaoService;

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra um novo usuário e dispara e-mail de confirmação")
    @ApiResponse(responseCode = "201", description = "Usuário criado")
    @ApiResponse(responseCode = "400",
            description = "Dados inválidos (e-mail, senha fraca ou termos não aceitos) — corpo traz `erros` com campo e mensagem")
    @ApiResponse(responseCode = "409", description = "E-mail já cadastrado")
    public void cadastrar(@Valid @RequestBody CadastroRequest request) {
        cadastroService.cadastrar(request.nome(), request.email(), request.senha(), request.aceitouTermos());
    }

    @PostMapping("/email/confirmar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Confirma o e-mail do usuário a partir do token recebido por e-mail")
    @ApiResponse(responseCode = "204", description = "E-mail confirmado")
    @ApiResponse(responseCode = "400",
            description = "Token ausente/em branco (corpo traz `erros`), inválido, expirado ou já usado")
    public void confirmarEmail(@Valid @RequestBody ConfirmarEmailRequest request) {
        cadastroService.confirmarEmail(request.token());
    }

    @PostMapping("/email/reenviar")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Reenvia o e-mail de confirmação",
            description = "Sempre responde 202, mesmo se o e-mail não existir, já estiver confirmado ou o "
                    + "reenvio estiver dentro do cooldown — resposta idêntica em todos os casos (anti-enumeração).")
    @ApiResponse(responseCode = "202", description = "Aceito (não garante envio)")
    @ApiResponse(responseCode = "400", description = "E-mail ausente/em branco ou inválido — corpo traz `erros`")
    public void reenviarConfirmacao(@Valid @RequestBody ReenviarConfirmacaoRequest request) {
        cadastroService.reenviarConfirmacao(request.email());
    }

    @PostMapping("/login")
    @Operation(summary = "Autentica com e-mail e senha e emite os tokens de acesso e atualização",
            description = "E-mail inexistente responde como senha incorreta, com `tentativasRestantes` fixo no "
                    + "máximo (anti-enumeração). Conta bloqueada responde 423 antes de checar a senha. E-mail não "
                    + "confirmado só é revelado depois da senha correta.")
    @ApiResponse(responseCode = "200", description = "Autenticado")
    @ApiResponse(responseCode = "400", description = "Dados inválidos — corpo traz `erros` com campo e mensagem")
    @ApiResponse(responseCode = "401", description = "E-mail ou senha incorretos (corpo traz `tentativasRestantes`)")
    @ApiResponse(responseCode = "403", description = "E-mail ainda não confirmado")
    @ApiResponse(responseCode = "423", description = "Conta bloqueada por excesso de tentativas (corpo traz `bloqueadoAte`)")
    public ResponseEntity<TokensResponse> login(@Valid @RequestBody LoginRequest request) {
        TokensResponse tokens = autenticacaoService.autenticar(
                request.email(), request.senha(), request.manterConectado());
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/renovar")
    @Operation(summary = "Troca um refresh token válido por um novo par de tokens",
            description = "O refresh token é rotacionado a cada uso. Reutilizar um refresh token já rotacionado "
                    + "é tratado como sinal de roubo: revoga todos os tokens do usuário.")
    @ApiResponse(responseCode = "200", description = "Tokens renovados")
    @ApiResponse(responseCode = "400", description = "Dados inválidos — corpo traz `erros` com campo e mensagem")
    @ApiResponse(responseCode = "401", description = "Token de atualização inválido, expirado ou revogado")
    public ResponseEntity<TokensResponse> renovar(@Valid @RequestBody RenovarRequest request) {
        TokensResponse tokens = autenticacaoService.renovarTokens(request.tokenAtualizacao());
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Revoga o refresh token informado", description = "Idempotente — token já revogado ou inexistente também responde 204.")
    @ApiResponse(responseCode = "204", description = "Sessão encerrada")
    @ApiResponse(responseCode = "400", description = "Dados inválidos — corpo traz `erros` com campo e mensagem")
    public void logout(@Valid @RequestBody LogoutRequest request) {
        autenticacaoService.sair(request.tokenAtualizacao());
    }
}
