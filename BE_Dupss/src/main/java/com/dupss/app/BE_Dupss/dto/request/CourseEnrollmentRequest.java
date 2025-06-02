package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentRequest {
    @NotNull(message = "ID khóa học không được để trống")
    private Long courseId;
} 