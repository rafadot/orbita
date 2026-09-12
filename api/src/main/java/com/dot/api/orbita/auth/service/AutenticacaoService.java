package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.auth.api.dto.TokensResponse;
import com.dot.api.orbita.auth.domain.TokenAtualizacao;
import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.auth.repository.TokenAtualizacaoRepository;
import com.dot.api.orbita.auth.repository.UsuarioRepository;
import com.dot.api.orbita.core.config.AutenticacaoProperties;
import com.dot.api.orbita.core.security.GeradorToken;
import com.dot.api.orbita.core.error.NaoEncontradoException;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutenticacaoService {

    private final UsuarioRepository usuarioRepository;
    private final TokenAtualizacaoRepository tokenAtualizacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final GeradorToken geradorToken;
    private final JwtService jwtService;
    private final AutenticacaoProperties autenticacaoProperties;

    /**
     * E-mail inexistente responde com a mesma {@link CredenciaisInvalidasException}
     * de senha errada (anti-enumeração); e-mail não confirmado só é checado
     * depois da senha correta, pra não revelar o estado da conta sem
     * credencial válida.
     */
    @Transactional
    public TokensResponse autenticar(String email, String senha, boolean manterConectado) {
        Instant agora = Instant.now();
        Usuario usuario = buscarUsuarioParaLogin(email);
        validarContaDesbloqueada(usuario, agora);
        validarSenha(usuario, senha, agora);
        validarEmailConfirmado(usuario);
        resetarTentativas(usuario);
        return emitirTokens(usuario, manterConectado, agora);
    }

    /**
     * Reuso de um token de atualização já rotacionado é tratado como sinal
     * de roubo: revoga todos os tokens do usuário, não só o reutilizado.
     */
    @Transactional
    public TokensResponse renovarTokens(String tokenCru) {
        Instant agora = Instant.now();
        TokenAtualizacao token = buscarTokenAtualizacao(tokenCru);
        validarTokenNaoReutilizado(token, agora);
        validarTokenAtualizacaoValido(token, agora);
        Usuario usuario = buscarUsuarioDoToken(token);
        token.setRevogadoEm(agora);
        return emitirTokens(usuario, token.isPersistente(), agora);
    }

    /**
     * Busca o próprio usuário autenticado — {@code id} vem do {@code sub} do
     * JWT validado (via {@code UsuarioAtual}), nunca de input do cliente, por
     * isso um {@code findById} direto é seguro aqui.
     */
    public Usuario buscarUsuarioAtual(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário autenticado não encontrado."));
    }

    /** Idempotente — token já revogado ou inexistente não é erro. */
    @Transactional
    public void sair(String tokenCru) {
        String hash = geradorToken.hashear(tokenCru);
        tokenAtualizacaoRepository.findByTokenHash(hash)
                .filter(token -> token.getRevogadoEm() == null)
                .ifPresent(token -> token.setRevogadoEm(Instant.now()));
    }

    private Usuario buscarUsuarioParaLogin(String email) {
        return usuarioRepository.findByEmail(normalizarEmail(email))
                .orElseThrow(() -> new CredenciaisInvalidasException(autenticacaoProperties.numeroMaximoTentativasLogin()));
    }

    private void validarContaDesbloqueada(Usuario usuario, Instant agora) {
        if (usuario.bloqueado(agora)) {
            throw new ContaBloqueadaException(usuario.getBloqueadoAte());
        }
    }

    private void validarSenha(Usuario usuario, String senha, Instant agora) {
        if (passwordEncoder.matches(senha, usuario.getSenhaHash())) {
            return;
        }
        registrarTentativaFalha(usuario, agora);
        if (usuario.bloqueado(agora)) {
            throw new ContaBloqueadaException(usuario.getBloqueadoAte());
        }
        throw new CredenciaisInvalidasException(tentativasRestantes(usuario));
    }

    private void validarEmailConfirmado(Usuario usuario) {
        if (!usuario.emailConfirmado()) {
            throw new EmailNaoVerificadoException();
        }
    }

    private void registrarTentativaFalha(Usuario usuario, Instant agora) {
        usuario.setTentativasLoginFalhas(usuario.getTentativasLoginFalhas() + 1);
        if (usuario.getTentativasLoginFalhas() >= autenticacaoProperties.numeroMaximoTentativasLogin()) {
            usuario.setBloqueadoAte(agora.plus(autenticacaoProperties.duracaoBloqueioLogin()));
        }
    }

    private void resetarTentativas(Usuario usuario) {
        usuario.setTentativasLoginFalhas(0);
        usuario.setBloqueadoAte(null);
    }

    private int tentativasRestantes(Usuario usuario) {
        return Math.max(0, autenticacaoProperties.numeroMaximoTentativasLogin() - usuario.getTentativasLoginFalhas());
    }

    private TokenAtualizacao buscarTokenAtualizacao(String tokenCru) {
        String hash = geradorToken.hashear(tokenCru);
        return tokenAtualizacaoRepository.findByTokenHash(hash)
                .orElseThrow(() -> new TokenInvalidoException("Token de atualização inválido."));
    }

    private void validarTokenNaoReutilizado(TokenAtualizacao token, Instant agora) {
        if (token.getRevogadoEm() != null) {
            tokenAtualizacaoRepository.revogarTodosDoUsuario(token.getUsuarioId(), agora);
            throw new TokenInvalidoException("Token de atualização inválido.");
        }
    }

    private void validarTokenAtualizacaoValido(TokenAtualizacao token, Instant agora) {
        if (!token.valido(agora)) {
            throw new TokenInvalidoException("Token de atualização expirado.");
        }
    }

    private Usuario buscarUsuarioDoToken(TokenAtualizacao token) {
        return usuarioRepository.findById(token.getUsuarioId())
                .orElseThrow(() -> new TokenInvalidoException("Token de atualização inválido."));
    }

    private TokensResponse emitirTokens(Usuario usuario, boolean manterConectado, Instant agora) {
        String tokenAcessoCru = jwtService.emitirTokenAcesso(usuario);
        String tokenAtualizacaoCru = geradorToken.gerar();
        Duration duracaoAtualizacao = manterConectado
                ? autenticacaoProperties.duracaoTokenAtualizacaoMantendoConectado()
                : autenticacaoProperties.duracaoTokenAtualizacao();

        TokenAtualizacao tokenAtualizacao = TokenAtualizacao.builder()
                .id(UUID.randomUUID())
                .usuarioId(usuario.getId())
                .tokenHash(geradorToken.hashear(tokenAtualizacaoCru))
                .expiraEm(agora.plus(duracaoAtualizacao))
                .persistente(manterConectado)
                .criadoEm(agora)
                .build();
        tokenAtualizacaoRepository.save(tokenAtualizacao);

        return new TokensResponse(tokenAcessoCru, "Bearer", jwtService.duracaoTokenAcesso().toSeconds(), tokenAtualizacaoCru);
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }
}
