package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.auth.domain.TokenConfirmacaoEmail;
import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.auth.repository.TokenConfirmacaoEmailRepository;
import com.dot.api.orbita.auth.repository.UsuarioRepository;
import com.dot.api.orbita.core.config.AutenticacaoProperties;
import com.dot.api.orbita.core.mail.EnviadorEmail;
import com.dot.api.orbita.core.security.GeradorToken;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CadastroService {

    private final UsuarioRepository usuarioRepository;
    private final TokenConfirmacaoEmailRepository tokenConfirmacaoEmailRepository;
    private final PasswordEncoder passwordEncoder;
    private final GeradorToken geradorToken;
    private final EnviadorEmail enviadorEmail;
    private final EmailConfirmacaoComposer emailConfirmacaoComposer;
    private final AutenticacaoProperties autenticacaoProperties;

    @Transactional
    public void cadastrar(String nome, String email, String senha, boolean aceitouTermos) {
        String emailNormalizado = normalizarEmail(email);
        if (usuarioRepository.existsByEmail(emailNormalizado)) {
            throw new EmailJaCadastradoException();
        }
        Instant agora = Instant.now();
        Usuario usuario = Usuario.builder()
                .id(UUID.randomUUID())
                .nome(nome)
                .email(emailNormalizado)
                .senhaHash(passwordEncoder.encode(senha))
                .termosAceitosEm(agora)
                .criadoEm(agora)
                .atualizadoEm(agora)
                .build();
        usuarioRepository.save(usuario);
        enviarTokenConfirmacao(usuario, agora);
    }

    @Transactional
    public void confirmarEmail(String tokenCru) {
        Instant agora = Instant.now();
        TokenConfirmacaoEmail token = buscarTokenConfirmacao(tokenCru);
        validarTokenConfirmacaoValido(token, agora);
        Usuario usuario = buscarUsuarioDoToken(token);
        usuario.setEmailConfirmadoEm(agora);
        token.setUsadoEm(agora);
    }

    /**
     * Silencioso mesmo que o e-mail não exista, já esteja confirmado ou
     * esteja dentro do cooldown — anti-enumeração.
     */
    @Transactional
    public void reenviarConfirmacao(String email) {
        String emailNormalizado = normalizarEmail(email);
        usuarioRepository.findByEmail(emailNormalizado)
                .filter(usuario -> !usuario.emailConfirmado())
                .ifPresent(usuario -> reenviarSeForaDoCooldown(usuario, Instant.now()));
    }

    private TokenConfirmacaoEmail buscarTokenConfirmacao(String tokenCru) {
        String hash = geradorToken.hashear(tokenCru);
        return tokenConfirmacaoEmailRepository.findByTokenHash(hash)
                .orElseThrow(() -> new TokenInvalidoException("Token de confirmação inválido."));
    }

    private void validarTokenConfirmacaoValido(TokenConfirmacaoEmail token, Instant agora) {
        if (!token.valido(agora)) {
            throw new TokenInvalidoException("Token de confirmação expirado ou já utilizado.");
        }
    }

    private Usuario buscarUsuarioDoToken(TokenConfirmacaoEmail token) {
        return usuarioRepository.findById(token.getUsuarioId())
                .orElseThrow(() -> new TokenInvalidoException("Token de confirmação inválido."));
    }

    private void reenviarSeForaDoCooldown(Usuario usuario, Instant agora) {
        Instant inicioCooldown = agora.minus(autenticacaoProperties.intervaloMinimoReenvioEmail());
        boolean dentroDoCooldown = tokenConfirmacaoEmailRepository
                .existsByUsuarioIdAndCriadoEmAfter(usuario.getId(), inicioCooldown);
        if (!dentroDoCooldown) {
            enviarTokenConfirmacao(usuario, agora);
        }
    }

    private void enviarTokenConfirmacao(Usuario usuario, Instant agora) {
        String tokenCru = geradorToken.gerar();
        TokenConfirmacaoEmail token = TokenConfirmacaoEmail.builder()
                .id(UUID.randomUUID())
                .usuarioId(usuario.getId())
                .tokenHash(geradorToken.hashear(tokenCru))
                .expiraEm(agora.plus(autenticacaoProperties.duracaoConfirmacaoEmail()))
                .criadoEm(agora)
                .build();
        tokenConfirmacaoEmailRepository.save(token);
        enviadorEmail.enviar(emailConfirmacaoComposer.montar(usuario, tokenCru));
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }
}
