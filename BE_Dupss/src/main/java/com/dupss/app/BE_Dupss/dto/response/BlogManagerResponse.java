package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogManagerResponse {
    private Long id;
    private String title;
    private String topic;
    private String description;
    private String content;
    private String authorName;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private ApprovalStatus status;
    private String tags;
    private String checkedBy;
} 