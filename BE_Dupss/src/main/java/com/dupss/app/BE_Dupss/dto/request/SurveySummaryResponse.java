package com.dupss.app.BE_Dupss.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveySummaryResponse {
    private Long surveyId;
    private String surveyTitle;
    private String description;
    private String surveyImage;
}
