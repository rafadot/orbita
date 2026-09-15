package com.dot.api.orbita.home.service;

import com.dot.api.orbita.home.api.dto.ResumoHomeResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class HomeService {

    public ResumoHomeResponse montarResumo(UUID usuarioId) {
        return new ResumoHomeResponse(!possuiInstituicaoConectada(usuarioId));
    }

    /**
     * Sempre {@code false} até existir o módulo {@code financas} — nenhum
     * usuário tem instituição conectada ainda. O parâmetro já recebe o id do
     * usuário autenticado para não mudar a assinatura quando a checagem real
     * existir.
     */
    private boolean possuiInstituicaoConectada(UUID usuarioId) {
        return false;
    }
}
