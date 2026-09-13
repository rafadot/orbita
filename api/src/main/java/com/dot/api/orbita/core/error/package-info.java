/**
 * Traduz exceções de domínio e nativas do MVC para {@code ProblemDetail}
 * (RFC 9457) — ver {@link com.dot.api.orbita.core.error.GlobalExceptionHandler}.
 *
 * {@code @NullMarked}: todo tipo aqui é não-nulo por padrão, salvo
 * {@code @Nullable} explícito — mesma convenção do Spring Framework 7
 * (JSpecify), necessária porque {@code GlobalExceptionHandler} sobrescreve
 * métodos de {@code ResponseEntityExceptionHandler} cujo pacote já é
 * {@code @NullMarked}; sem isso, parâmetro/retorno sem anotação aqui é
 * "nulidade não especificada" e diverge do contrato do método sobrescrito.
 */
@NullMarked
package com.dot.api.orbita.core.error;

import org.jspecify.annotations.NullMarked;
