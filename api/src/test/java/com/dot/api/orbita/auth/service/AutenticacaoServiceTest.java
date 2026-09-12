package com.dot.api.orbita.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dot.api.orbita.auth.api.dto.TokensResponse;
import com.dot.api.orbita.auth.domain.TokenAtualizacao;
import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.auth.repository.TokenAtualizacaoRepository;
import com.dot.api.orbita.auth.repository.UsuarioRepository;
import com.dot.api.orbita.core.config.AutenticacaoProperties;
import com.dot.api.orbita.core.error.NaoEncontradoException;
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
class AutenticacaoServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private TokenAtualizacaoRepository tokenAtualizacaoRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private GeradorToken geradorToken;
    @Mock
    private JwtService jwtService;

    private AutenticacaoService autenticacaoService;

    private static final AutenticacaoProperties PROPERTIES = new AutenticacaoProperties(
            "segredo-de-teste-com-pelo-menos-32-bytes!!", Duration.ofMinutes(15), Duration.ofDays(1),
            Duration.ofDays(30), Duration.ofMinutes(30), Duration.ofSeconds(60), 5, Duration.ofMinutes(15));

    @BeforeEach
    void montarService() {
        autenticacaoService = new AutenticacaoService(usuarioRepository, tokenAtualizacaoRepository, passwordEncoder,
                geradorToken, jwtService, PROPERTIES);
    }

    private Usuario usuarioValido() {
        return Usuario.builder()
                .id(UUID.randomUUID())
                .email("rafael@orbita.app")
                .senhaHash("hash")
                .emailConfirmadoEm(Instant.now())
                .tentativasLoginFalhas(0)
                .build();
    }

    @Test
    void deve_lancar_credenciais_invalidas_quando_email_nao_existe() {
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacaoService.autenticar("rafael@orbita.app", "qualquer", false))
                .isInstanceOf(CredenciaisInvalidasException.class)
                .satisfies(excecao -> assertThat(((CredenciaisInvalidasException) excecao).getExtensions())
                        .containsEntry("tentativasRestantes", PROPERTIES.numeroMaximoTentativasLogin()));
    }

    @Test
    void deve_lancar_conta_bloqueada_quando_usuario_ja_esta_bloqueado() {
        Usuario usuario = usuarioValido().toBuilder()
                .bloqueadoAte(Instant.now().plus(Duration.ofMinutes(5)))
                .build();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> autenticacaoService.autenticar("rafael@orbita.app", "senha", false))
                .isInstanceOf(ContaBloqueadaException.class);
    }

    @Test
    void deve_decrementar_tentativas_restantes_quando_senha_incorreta() {
        Usuario usuario = usuarioValido();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("errada", "hash")).thenReturn(false);

        assertThatThrownBy(() -> autenticacaoService.autenticar("rafael@orbita.app", "errada", false))
                .isInstanceOf(CredenciaisInvalidasException.class)
                .satisfies(excecao -> assertThat(((CredenciaisInvalidasException) excecao).getExtensions())
                        .containsEntry("tentativasRestantes", 4));
    }

    @Test
    void deve_bloquear_quando_excede_maximo_de_tentativas() {
        Usuario usuario = usuarioValido().toBuilder().tentativasLoginFalhas(4).build();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("errada", "hash")).thenReturn(false);

        assertThatThrownBy(() -> autenticacaoService.autenticar("rafael@orbita.app", "errada", false))
                .isInstanceOf(ContaBloqueadaException.class);
    }

    @Test
    void deve_lancar_email_nao_verificado_quando_senha_correta_mas_email_pendente() {
        Usuario usuario = usuarioValido().toBuilder().emailConfirmadoEm(null).build();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("correta", "hash")).thenReturn(true);

        assertThatThrownBy(() -> autenticacaoService.autenticar("rafael@orbita.app", "correta", false))
                .isInstanceOf(EmailNaoVerificadoException.class);
    }

    @Test
    void deve_autenticar_e_resetar_tentativas_quando_credenciais_corretas() {
        Usuario usuario = usuarioValido().toBuilder().tentativasLoginFalhas(3).build();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("correta", "hash")).thenReturn(true);
        when(jwtService.emitirTokenAcesso(usuario)).thenReturn("token-acesso");
        when(jwtService.duracaoTokenAcesso()).thenReturn(Duration.ofMinutes(15));
        when(geradorToken.gerar()).thenReturn("refresh-cru");
        when(geradorToken.hashear("refresh-cru")).thenReturn("refresh-hash");

        TokensResponse resposta = autenticacaoService.autenticar("rafael@orbita.app", "correta", false);

        assertThat(usuario.getTentativasLoginFalhas()).isZero();
        assertThat(usuario.getBloqueadoAte()).isNull();
        assertThat(resposta.tokenAcesso()).isEqualTo("token-acesso");
        assertThat(resposta.tokenAtualizacao()).isEqualTo("refresh-cru");
        assertThat(resposta.tipoToken()).isEqualTo("Bearer");

        ArgumentCaptor<TokenAtualizacao> captor = ArgumentCaptor.forClass(TokenAtualizacao.class);
        verify(tokenAtualizacaoRepository).save(captor.capture());
        assertThat(captor.getValue().isPersistente()).isFalse();
    }

    @Test
    void deve_usar_duracao_maior_quando_manter_conectado() {
        Usuario usuario = usuarioValido();
        when(usuarioRepository.findByEmail("rafael@orbita.app")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("correta", "hash")).thenReturn(true);
        when(jwtService.emitirTokenAcesso(usuario)).thenReturn("token-acesso");
        when(jwtService.duracaoTokenAcesso()).thenReturn(Duration.ofMinutes(15));
        when(geradorToken.gerar()).thenReturn("refresh-cru");
        when(geradorToken.hashear("refresh-cru")).thenReturn("refresh-hash");

        autenticacaoService.autenticar("rafael@orbita.app", "correta", true);

        ArgumentCaptor<TokenAtualizacao> captor = ArgumentCaptor.forClass(TokenAtualizacao.class);
        verify(tokenAtualizacaoRepository).save(captor.capture());
        assertThat(captor.getValue().isPersistente()).isTrue();
        assertThat(captor.getValue().getExpiraEm()).isAfter(Instant.now().plus(Duration.ofDays(29)));
    }

    @Test
    void deve_lancar_excecao_quando_renovar_com_token_inexistente() {
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenAtualizacaoRepository.findByTokenHash("token-hash")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacaoService.renovarTokens("token-cru"))
                .isInstanceOf(TokenInvalidoException.class);
    }

    @Test
    void deve_revogar_tudo_quando_renovar_com_token_ja_revogado() {
        UUID usuarioId = UUID.randomUUID();
        TokenAtualizacao token = TokenAtualizacao.builder()
                .usuarioId(usuarioId)
                .expiraEm(Instant.now().plus(Duration.ofDays(1)))
                .revogadoEm(Instant.now().minus(Duration.ofMinutes(1)))
                .build();
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenAtualizacaoRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> autenticacaoService.renovarTokens("token-cru"))
                .isInstanceOf(TokenInvalidoException.class);

        verify(tokenAtualizacaoRepository).revogarTodosDoUsuario(eq(usuarioId), any());
    }

    @Test
    void deve_lancar_excecao_quando_renovar_com_token_expirado() {
        TokenAtualizacao token = TokenAtualizacao.builder()
                .usuarioId(UUID.randomUUID())
                .expiraEm(Instant.now().minus(Duration.ofMinutes(1)))
                .build();
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenAtualizacaoRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> autenticacaoService.renovarTokens("token-cru"))
                .isInstanceOf(TokenInvalidoException.class);
    }

    @Test
    void deve_rotacionar_token_quando_renovar_com_token_valido() {
        Usuario usuario = usuarioValido();
        TokenAtualizacao token = TokenAtualizacao.builder()
                .usuarioId(usuario.getId())
                .expiraEm(Instant.now().plus(Duration.ofDays(1)))
                .persistente(true)
                .build();
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenAtualizacaoRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(token));
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(jwtService.emitirTokenAcesso(usuario)).thenReturn("novo-token-acesso");
        when(jwtService.duracaoTokenAcesso()).thenReturn(Duration.ofMinutes(15));
        when(geradorToken.gerar()).thenReturn("novo-refresh-cru");
        when(geradorToken.hashear("novo-refresh-cru")).thenReturn("novo-refresh-hash");

        TokensResponse resposta = autenticacaoService.renovarTokens("token-cru");

        assertThat(token.getRevogadoEm()).isNotNull();
        assertThat(resposta.tokenAcesso()).isEqualTo("novo-token-acesso");
        assertThat(resposta.tokenAtualizacao()).isEqualTo("novo-refresh-cru");
    }

    @Test
    void deve_revogar_token_quando_sair_com_token_valido() {
        TokenAtualizacao token = TokenAtualizacao.builder()
                .usuarioId(UUID.randomUUID())
                .expiraEm(Instant.now().plus(Duration.ofDays(1)))
                .build();
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenAtualizacaoRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(token));

        autenticacaoService.sair("token-cru");

        assertThat(token.getRevogadoEm()).isNotNull();
    }

    @Test
    void deve_ser_idempotente_quando_sair_com_token_inexistente() {
        when(geradorToken.hashear("token-cru")).thenReturn("token-hash");
        when(tokenAtualizacaoRepository.findByTokenHash("token-hash")).thenReturn(Optional.empty());

        autenticacaoService.sair("token-cru");
    }

    @Test
    void deve_retornar_usuario_quando_buscar_usuario_atual_existente() {
        Usuario usuario = usuarioValido();
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));

        assertThat(autenticacaoService.buscarUsuarioAtual(usuario.getId())).isEqualTo(usuario);
    }

    @Test
    void deve_lancar_excecao_quando_buscar_usuario_atual_inexistente() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacaoService.buscarUsuarioAtual(id))
                .isInstanceOf(NaoEncontradoException.class);
    }
}
