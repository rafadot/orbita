package com.dot.api.orbita.auth.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SenhaForteValidator.class)
public @interface SenhaForte {

    String message() default "A senha deve ter ao menos 10 caracteres, "
            + "incluir maiúscula ou número, e um símbolo.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
