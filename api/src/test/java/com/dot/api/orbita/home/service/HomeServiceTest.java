package com.dot.api.orbita.home.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.dot.api.orbita.home.api.dto.ResumoHomeResponse;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class HomeServiceTest {

    private final HomeService homeService = new HomeService();

    @Test
    void deve_indicar_primeiro_acesso_quando_nao_ha_instituicao_conectada() {
        ResumoHomeResponse resumo = homeService.montarResumo(UUID.randomUUID());

        assertThat(resumo.primeiroAcesso()).isTrue();
    }
}
