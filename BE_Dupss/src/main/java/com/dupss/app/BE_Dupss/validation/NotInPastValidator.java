package com.dupss.app.BE_Dupss.validation;

import com.dupss.app.BE_Dupss.dto.request.AppointmentRequestDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;

public class NotInPastValidator implements ConstraintValidator<NotInPast, AppointmentRequestDto> {

    @Override
    public boolean isValid(AppointmentRequestDto dto, ConstraintValidatorContext context) {
        if (dto.getAppointmentDate() == null || dto.getAppointmentTime() == null) {
            return true;
        }

        LocalDateTime appointmentDateTime = LocalDateTime.of(dto.getAppointmentDate(), dto.getAppointmentTime());
        return appointmentDateTime.isAfter(LocalDateTime.now());
    }
}
