package com.dupss.app.BE_Dupss.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogHomeResponse {
    private Long id;
    private String title;
    private String topic;
    private String summary;
    private String coverImage;
    private LocalDate createdAt;
    private String tags;
}
