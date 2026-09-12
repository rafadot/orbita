package com.dot.api.orbita.core.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EnviadorEmail {

    private final JavaMailSender javaMailSender;

    public void enviar(MensagemEmail mensagem) {
        SimpleMailMessage mensagemSmtp = new SimpleMailMessage();
        mensagemSmtp.setTo(mensagem.destinatario());
        mensagemSmtp.setSubject(mensagem.assunto());
        mensagemSmtp.setText(mensagem.corpo());
        javaMailSender.send(mensagemSmtp);
    }
}
