package com.dupss.app.BE_Dupss.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class QuizResultResponse {
    private int totalScore;
    private double score;
    private String message;
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm")
    private LocalDateTime submittedAt;
}
