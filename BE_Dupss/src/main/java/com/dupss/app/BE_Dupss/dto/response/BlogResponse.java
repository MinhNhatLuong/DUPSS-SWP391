package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogResponse {
    private Long id;
    private String title;
    private String topic;
    private String description;
    private String content;
    private List<String> imageUrls;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ApprovalStatus status;
}