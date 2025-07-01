package com.dupss.app.BE_Dupss.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NotInPastValidator.class)
public @interface NotInPast {
    String message() default "Không được chọn ngày giờ trong quá khứ";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
