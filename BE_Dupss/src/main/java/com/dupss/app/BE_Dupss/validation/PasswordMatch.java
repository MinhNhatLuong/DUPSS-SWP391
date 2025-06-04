package com.dupss.app.BE_Dupss.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordMatchValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordMatch {
    String message() default "Password and confirm password do not match";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}