package com.dot.api.orbita.core.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Component;

/**
 * Gera e hasheia tokens opacos usados em refresh token e confirmação de
 * e-mail. O valor gerado (cru) é o que vai pro link/resposta; só o hash
 * (SHA-256) é persistido — nunca o token em claro.
 */
@Component
public class GeradorToken {

    private static final int TAMANHO_BYTES = 32;

    private final SecureRandom secureRandom = new SecureRandom();

    public String gerar() {
        byte[] bytes = new byte[TAMANHO_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashear(String tokenCru) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(tokenCru.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Algoritmo SHA-256 indisponível.", e);
        }
    }
}
