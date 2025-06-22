package com.dupss.app.BE_Dupss.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveyResultResponse {
    private Long id;
    private String surveyName;
    private Integer totalScore;
    private Integer score;
    private String advice;
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime submittedAt;
}
