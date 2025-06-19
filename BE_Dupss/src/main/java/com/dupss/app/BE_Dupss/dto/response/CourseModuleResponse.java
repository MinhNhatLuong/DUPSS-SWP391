package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.VideoCourse;
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
public class CourseModuleResponse {
    private Long id;
    private String title;
    private List<VideoCourse> videos;
    private String documentUrl;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 