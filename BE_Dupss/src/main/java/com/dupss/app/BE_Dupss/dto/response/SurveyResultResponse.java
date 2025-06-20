package com.dupss.app.BE_Dupss.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveyResultResponse {
    private String surveyName;
    private Integer totalScore;
    private Integer score;
    private String advice;
}
