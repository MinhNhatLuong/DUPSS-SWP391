package com.dupss.app.BE_Dupss.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class QuizResultResponse {
    private int totalScore;
    private double scorePercent;
    private String message;
}
