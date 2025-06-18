package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SurveyResultRequest {
    @NotNull(message = "Survey ID cannot be null")
    private Long surveyId;


    @NotEmpty(message = "Selected option IDs cannot be empty")
    private List<Long> selectedOptionIds;
}
