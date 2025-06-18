package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentResponse {
    private Long id;
    private CourseResponse course;
    private UserDetailResponse user;
    private LocalDateTime enrollmentDate;
    private LocalDateTime completionDate;
    private EnrollmentStatus status;
    private Double progress;
} 