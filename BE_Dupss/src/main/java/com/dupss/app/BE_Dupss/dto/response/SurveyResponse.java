package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SurveyResponse {
    private Long id;
    private String title;
    private String description;
    private String surveyImage;
    private boolean active;
    private boolean forCourse;
    private LocalDateTime createdAt;
    private List<SurveySectionDTO> sections;
    private List<SurveyConditionDTO> conditions;
    private ApprovalStatus status;
    private String approvedByName;
    private String rejectedByName;
    private LocalDateTime approvalDate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SurveySectionDTO {
        private Long id;
        private String sectionName;
        private List<SurveyQuestionDTO> questions;

        public static SurveySectionDTO fromEntity(SurveySection section) {
            return SurveySectionDTO.builder()
                    .id(section.getId())
                    .sectionName(section.getSectionName())
                    .questions(
                            section.getQuestions().stream()
                                    .map(SurveyQuestionDTO::fromEntity)
                                    .collect(Collectors.toList())
                    )
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SurveyQuestionDTO {
        private Long id;
        private String questionText;
        private List<SurveyOptionDTO> options;

        public static SurveyQuestionDTO fromEntity(SurveyQuestion question) {
            return SurveyQuestionDTO.builder()
                    .id(question.getId())
                    .questionText(question.getQuestionText())
//                    .required(question.isRequired())
                    .options(
                            question.getOptions().stream()
                                    .map(SurveyOptionDTO::fromEntity)
                                    .collect(Collectors.toList())
                    )
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SurveyOptionDTO {
        private Long id;
        private String optionText;
        private Integer score;

        public static SurveyOptionDTO fromEntity(SurveyOption option) {
            return SurveyOptionDTO.builder()
                    .id(option.getId())
                    .optionText(option.getOptionText())
                    .score(option.getScore())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SurveyConditionDTO {
        private String operator;
        private Integer value;
        private String message;

        public static SurveyConditionDTO fromEntity(SurveyCondition c) {
            return SurveyConditionDTO.builder()
                    .operator(c.getOperator())
                    .value(c.getValue())
                    .message(c.getMessage())
                    .build();
        }
    }
}
