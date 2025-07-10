package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyManagerResponse {
    private Long surveyId;
    private String surveyTitle;
    private String description;
    private String surveyImage;
    private boolean active;
    private boolean forCourse;
    private LocalDateTime createdAt;
    private String createdBy;
    private ApprovalStatus status;
//    private String checkedBy;
} 