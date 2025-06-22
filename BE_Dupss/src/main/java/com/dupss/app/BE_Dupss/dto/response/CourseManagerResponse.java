package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
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
public class CourseManagerResponse {
    private Long id;
    private String title;
    private String description;
    private String coverImage;
    private String topicName;
    private String content;
    private Integer duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String creatorName;
    private ApprovalStatus status;
    private String approvedByName;
    private String rejectedByName;
    private LocalDateTime approvalDate;
} 