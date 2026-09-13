package com.dot.api.orbita.core.security;

import com.dot.api.orbita.core.config.FrontendProperties;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Stateless, sem sessão, sem CSRF. Grupos de endpoints públicos:
 * {@code /auth/**} — ver ADR 0002 e ADR 0001 (multiusuário desde o dia 1) —
 * e a documentação OpenAPI ({@code /v3/api-docs/**}, {@code /swagger-ui/**}),
 * que só existe de fato quando o profile {@code local} liga o springdoc
 * (ver ADR 0007); em outros ambientes esses paths retornam 404, não 401.
 * Front e API rodam em servidores diferentes (sem domínio/proxy comum) —
 * {@link #corsConfigurationSource(FrontendProperties)} libera só a origem
 * de {@code orbita.frontend-url} para chamar a API. Sem
 * {@code allowCredentials}: a sessão vai em {@code Authorization: Bearer},
 * nunca em cookie, então não há nada de credencial de navegador a liberar.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http, JwtDecoder jwtDecoder, CorsConfigurationSource corsConfigurationSource) {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder)))
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(FrontendProperties frontendProperties) {
        CorsConfiguration configuracao = new CorsConfiguration();
        configuracao.setAllowedOrigins(List.of(frontendProperties.frontendUrl()));
        configuracao.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        configuracao.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource origem = new UrlBasedCorsConfigurationSource();
        origem.registerCorsConfiguration("/**", configuracao);
        return origem;
    }
}
