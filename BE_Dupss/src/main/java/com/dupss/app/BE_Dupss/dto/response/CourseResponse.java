package com.dupss.app.BE_Dupss.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String targetAudience;
    private String coverImage;
    private String content;
    private Integer duration;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDetailResponse creator;
    private List<CourseModuleResponse> modules;
    private Integer enrollmentCount;
    private Boolean isEnrolled;
} 