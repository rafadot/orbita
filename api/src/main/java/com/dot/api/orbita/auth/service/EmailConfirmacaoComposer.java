package com.dot.api.orbita.auth.service;

import com.dot.api.orbita.auth.domain.Usuario;
import com.dot.api.orbita.core.config.AutenticacaoProperties;
import com.dot.api.orbita.core.config.FrontendProperties;
import com.dot.api.orbita.core.mail.MensagemEmail;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailConfirmacaoComposer {

    private final AutenticacaoProperties autenticacaoProperties;
    private final FrontendProperties frontendProperties;

    public MensagemEmail montar(Usuario usuario, String tokenCru) {
        String link = frontendProperties.frontendUrl() + "/confirmar-email?token=" + tokenCru;
        String corpo = "Olá, " + usuario.getNome() + "!\n\n"
                + "Confirme seu e-mail clicando no link abaixo. O link expira em "
                + autenticacaoProperties.duracaoConfirmacaoEmail().toMinutes() + " minutos.\n\n"
                + link;
        return new MensagemEmail(usuario.getEmail(), "Confirme seu e-mail — Orbita", corpo);
    }
}
