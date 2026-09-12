package com.dot.api.orbita;

import com.dot.api.orbita.core.config.AutenticacaoProperties;
import com.dot.api.orbita.core.config.FrontendProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({AutenticacaoProperties.class, FrontendProperties.class})
public class OrbitaApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrbitaApplication.class, args);
	}

}
