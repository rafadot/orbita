package com.dot.api.orbita.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dot.api.orbita.auth.domain.TokenConfirmacaoEmail;
import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.auth.repository.TokenConfirmacaoEmailRepository;
import com.dot.api.orbita.auth.repository.UsuarioRepository;
import com.dot.api.orbita.core.config.AutenticacaoProperties;
import com.dot.api.orbita.core.mail.EnviadorEmail;
import com.dot.api.orbita.core.mail.MensagemEmail;
import com.dot.api.orbita.core.security.GeradorToken;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class CadastroServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private TokenConfirmacaoEmailRepository tokenConfirmacaoEmailRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private GeradorToken geradorToken;
    @Mock
    private EnviadorEmail enviadorEmail;
    @Mock
    private EmailConfirmacaoComposer emailConfirmacaoComposer;

    private CadastroService cadastroService;

    private static final AutenticacaoProperties PROPERTIES = new AutenticacaoProperties(
            "segredo-de-teste-com-pelo-menos-32-bytes!!", Duration.ofMinutes(15), Duration.ofDays(1),
            Duration.ofDays(30), Duration.ofMinutes(30), Duration.ofSeconds(60), 5, Duration.ofMinutes(15));

    @BeforeEach
    void montarService() {
        cadastroService = new CadastroService(usuarioRepository, tokenConfirmacaoEmailRepository, passwordEncoder,
                geradorToken, enviadorEmail, emailConfirmacaoComposer, PROPERTIES);
    }

    @Test
    void deve_cadastrar_usuario_e_enviar_email_quando_email_nao_existe() {
        when(usuarioRepository.existsByEmail("rafael@orbita.app")).thenReturn(false);
        when(passwordEncoder.encode("SenhaForte1!")).thenReturn("hash-argon2");
        when(geradorToken.gerar()).thenReturn("token-cru");
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(emailConfirmacaoComposer.montar(any(Usuario.class), anyString()))
                .thenReturn(new MensagemEmail("rafael@orbita.app", "assunto", "corpo"));

        cadastroService.cadastrar("Rafael", "  Rafael@Orbita.app  ", "SenhaForte1!", true);

        ArgumentCaptor<Usuario> usuarioCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());
        Usuario usuarioSalvo = usuarioCaptor.getValue();
        assertThat(usuarioSalvo.getNome()).isEqualTo("Rafael");
        assertThat(usuarioSalvo.getEmail()).isEqualTo("rafael@orbita.app");
        assertThat(usuarioSalvo.getSenhaHash()).isEqualTo("hash-argon2");
        assertThat(usuarioSalvo.getTermosAceitosEm()).isNotNull();

        verify(tokenConfirmacaoEmailRepository).save(any(TokenConfirmacaoEmail.class));
        verify(enviadorEmail).enviar(any(MensagemEmail.class));
    }

    @Test
    void deve_lancar_excecao_quando_email_ja_cadastrado() {
        when(usuarioRepository.existsByEmail("rafael@orbita.app")).thenReturn(true);

        assertThatThrownBy(() -> cadastroService.cadastrar("Rafael", "rafael@orbita.app", "SenhaForte1!", true))
                .isInstanceOf(EmailJaCadastradoException.class);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void deve_confirmar_email_quando_token_valido() {
        Usuario usuario = Usuario.builder().id(UUID.randomUUID()).build();
        TokenConfirmacaoEmail token = TokenConfirmacaoEmail.builder()
                .usuarioId(usuario.getId())
                .expiraEm(Instant.now().plus(Duration.ofMinutes(10)))
                .build();
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenConfirmacaoEmailRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(token));
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));

        cadastroService.confirmarEmail("token-cru");

        assertThat(usuario.emailConfirmado()).isTrue();
        assertThat(token.getUsadoEm()).isNotNull();
    }

    @Test
    void deve_lancar_excecao_quando_token_confirmacao_nao_encontrado() {
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenConfirmacaoEmailRepository.findByTokenHash("token-hash")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cadastroService.confirmarEmail("token-cru"))
                .isInstanceOf(TokenInvalidoException.class);
    }

    @Test
    void deve_lancar_excecao_quando_token_confirmacao_expirado() {
        TokenConfirmacaoEmail token = TokenConfirmacaoEmail.builder()
                .usuarioId(UUID.randomUUID())
                .expiraEm(Instant.now().minus(Duration.ofMinutes(1)))
                .build();
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenConfirmacaoEmailRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> cadastroService.confirmarEmail("token-cru"))
                .isInstanceOf(TokenInvalidoException.class);
    }

    @Test
    void deve_ignorar_silenciosamente_quando_reenviar_para_email_inexistente() {
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.empty());

        cadastroService.reenviarConfirmacao("rafael@orbita.app");

        verify(enviadorEmail, never()).enviar(any());
    }

    @Test
    void deve_ignorar_quando_reenviar_para_email_ja_confirmado() {
        Usuario usuario = Usuario.builder().id(UUID.randomUUID()).emailConfirmadoEm(Instant.now()).build();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));

        cadastroService.reenviarConfirmacao("rafael@orbita.app");

        verify(enviadorEmail, never()).enviar(any());
    }

    @Test
    void deve_ignorar_quando_reenviar_dentro_do_cooldown() {
        Usuario usuario = Usuario.builder().id(UUID.randomUUID()).build();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));
        when(tokenConfirmacaoEmailRepository.existsByUsuarioIdAndCriadoEmAfter(eq(usuario.getId()), any()))
                .thenReturn(true);

        cadastroService.reenviarConfirmacao("rafael@orbita.app");

        verify(enviadorEmail, never()).enviar(any());
    }

    @Test
    void deve_reenviar_quando_fora_do_cooldown() {
        Usuario usuario = Usuario.builder().id(UUID.randomUUID()).build();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));
        when(tokenConfirmacaoEmailRepository.existsByUsuarioIdAndCriadoEmAfter(eq(usuario.getId()), any()))
                .thenReturn(false);
        when(geradorToken.gerar()).thenReturn("token-cru");
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(emailConfirmacaoComposer.montar(any(Usuario.class), anyString()))
                .thenReturn(new MensagemEmail("rafael@orbita.app", "assunto", "corpo"));

        cadastroService.reenviarConfirmacao("rafael@orbita.app");

        verify(enviadorEmail, times(1)).enviar(any());
    }
}
