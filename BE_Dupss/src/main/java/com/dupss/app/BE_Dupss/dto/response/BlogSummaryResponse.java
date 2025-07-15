package com.dupss.app.BE_Dupss.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogSummaryResponse {
    private Long id;
    private String title;
    private String topic;
    private String summary;
    private String coverImage;
    private LocalDateTime createdAt;
}
