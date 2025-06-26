package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveyCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
//    private MultipartFile imageCover;

//    @Valid
//    @NotEmpty(message = "At least one question is required")
//    private List<QuestionRequest> questions;

    @Valid
    @NotEmpty(message = "At least one section is required")
    private List<SurveySection> sections;
    @Data
    public static class SurveySection {
        private String sectionName;
        List<QuestionRequest> questions;
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class QuestionRequest {
            @NotBlank(message = "Question text is required")
            private String questionText;
            @Valid
            private List<OptionRequest> options;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class OptionRequest {
            @NotBlank(message = "Option text is required")
            private String optionText;

            @NotNull(message = "Score is required")
            private Integer score;
        }
    }
    @Valid
    @NotEmpty(message = "At least one condition is required")
    private List<ConditionRequest> conditions;
    @Data
    public static class ConditionRequest {
        @NotBlank
        private String operator;

        @NotNull
        private Integer value;

        @NotBlank
        private String message;
    }
}