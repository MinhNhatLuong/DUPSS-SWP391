package com.dupss.app.BE_Dupss.validation;

import com.dupss.app.BE_Dupss.dto.request.ChangePasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.RegisterRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, Object> {

    @Override
    public boolean isValid(Object object, ConstraintValidatorContext context) {
        if (object instanceof RegisterRequest request) {
            if (request.getPassword() == null || request.getConfirmPassword() == null) {
                return false;
            }
            boolean matched = request.getPassword().equals(request.getConfirmPassword());
            if (!matched) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Mật khẩu không khớp")
                        .addPropertyNode("confirmPassword")
                        .addConstraintViolation();
            }
            return matched;
        } else if (object instanceof ChangePasswordRequest request) {
            if (request.getNewPassword() == null || request.getConfirmPassword() == null) {
                return false;
            }
            boolean matched = request.getNewPassword().equals(request.getConfirmPassword());
            if (!matched) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Mật khẩu không khớp")
                        .addPropertyNode("confirmPassword")
                        .addConstraintViolation();
            }
            return matched;
        }
        return false;
    }
}