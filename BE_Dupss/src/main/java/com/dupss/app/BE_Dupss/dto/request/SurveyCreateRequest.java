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
    @NotBlank(message = "Tiêu đề khảo sát không được để trống")
    private String title;

    private String description;
    @Valid
    @NotEmpty(message = "Phải có ít nhất một section")
    private List<SurveySection> sections;
    @Data
    public static class SurveySection {
        private Long sectionId;
        private String sectionName;
        List<QuestionRequest> questions;
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class QuestionRequest {
            private Long questionId;

            @NotBlank(message = "Tên câu hỏi không được để trống")
            private String questionText;
            @Valid
            private List<OptionRequest> options;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class OptionRequest {
            private Long optionId;
            @NotBlank(message = "Tên tùy chọn không được để trống")
            private String optionText;

            @NotNull(message = "Điểm không được để trống")
            private Integer score;
        }
    }
    @Valid
    @NotEmpty(message = "Phải có ít nhất một điều kiện")
    private List<ConditionRequest> conditions;
    @Data
    public static class ConditionRequest {
        private Long conditionId;

        @NotBlank
        private String operator;

        @NotNull
        private Integer value;

        @NotBlank
        private String message;
    }
}