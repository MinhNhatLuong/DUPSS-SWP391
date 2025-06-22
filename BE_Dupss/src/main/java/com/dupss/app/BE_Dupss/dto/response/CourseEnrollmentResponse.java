package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.EnrollmentStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String courseTitle;
    private String username;
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime enrollmentDate;
    private LocalDateTime completionDate;
    private EnrollmentStatus status;
    private Double progress;
} 