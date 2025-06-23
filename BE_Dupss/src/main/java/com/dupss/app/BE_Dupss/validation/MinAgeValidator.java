package com.dupss.app.BE_Dupss.validation;


import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

public class MinAgeValidator implements ConstraintValidator<MinAge, LocalDate> {

    private int minAge;

    @Override
    public void initialize(MinAge constraintAnnotation) {
        this.minAge = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(LocalDate dob, ConstraintValidatorContext context) {
        if (dob == null) return true; // Tránh báo lỗi nếu để @NotNull xử lý riêng
        return Period.between(dob, LocalDate.now()).getYears() >= minAge;
    }
}

