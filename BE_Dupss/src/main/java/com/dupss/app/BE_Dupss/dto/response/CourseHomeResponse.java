package com.dupss.app.BE_Dupss.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseHomeResponse {
    private Long id;
    private String title;
    private String summary;
    private String coverImage;
    private LocalDateTime createdAt;
    private String topicName;
    private boolean isEnrolled;
}
