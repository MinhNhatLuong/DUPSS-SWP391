package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveySummaryResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResponse;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.CloudinaryService;
import com.dupss.app.BE_Dupss.service.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyServiceImpl implements SurveyService {

    private final SurveyRepo surveyRepository;
//    private final SurveyResultRepo surveyResultRepository;
    private final SurveyConditionRepo surveyConditionRepository;
    private final SurveyQuestionRepo surveyQuestionRepository;
    private final SurveyOptionRepo surveyOptionRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;


    @Override
    public SurveyResponse createSurvey(SurveyCreateRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Survey survey = new Survey();
        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());
        survey.setCreatedBy(author);
        survey.setActive(true);
        survey.setCreatedAt(LocalDateTime.now());

        if (request.getImageCover() != null && !request.getImageCover().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(request.getImageCover());
            survey.setSurveyImage(imageUrl);
        }
        List<SurveySection> sectionList = new ArrayList<>();
        for (SurveyCreateRequest.SurveySection sectionReq : request.getSections()) {
            SurveySection section = new SurveySection();
            section.setSectionName(sectionReq.getSectionName());
            section.setSurvey(survey);

            List<SurveyQuestion> questions = new ArrayList<>();
            for (SurveyCreateRequest.SurveySection.QuestionRequest questionReq : sectionReq.getQuestions()) {
                SurveyQuestion question = new SurveyQuestion();
                question.setQuestionText(questionReq.getQuestionText());
                question.setSection(section);

                List<SurveyOption> optionList = new ArrayList<>();
                if (questionReq.getOptions() != null) {
                    for (SurveyCreateRequest.SurveySection.OptionRequest optionReq : questionReq.getOptions()) {
                        SurveyOption option = new SurveyOption();
                        option.setOptionText(optionReq.getOptionText());
                        option.setScore(optionReq.getScore() != null ? optionReq.getScore() : 0);
                        option.setQuestion(question);
                        optionList.add(option);
                    }
                }

                question.setOptions(optionList);
                questions.add(question);
            }

            section.setQuestions(questions);
            sectionList.add(section);
        }

        survey.setSections(sectionList);

        List<SurveyCondition> conditionList = new ArrayList<>();
        if (request.getConditions() != null) {
            for (SurveyCreateRequest.ConditionRequest conditionReq : request.getConditions()) {
                SurveyCondition condition = new SurveyCondition();
                condition.setOperator(conditionReq.getOperator());
                condition.setValue(conditionReq.getValue());
                condition.setMessage(conditionReq.getMessage());
                condition.setSurvey(survey);
                conditionList.add(condition);
            }
        }
        survey.setConditions(conditionList);
        Survey savedSurvey = surveyRepository.save(survey);
        return SurveyResponse.builder()
                .id(savedSurvey.getId())
                .title(savedSurvey.getTitle())
                .image(savedSurvey.getSurveyImage())
                .description(savedSurvey.getDescription())
                .createdAt(savedSurvey.getCreatedAt())
                .creator(savedSurvey.getCreatedBy().getUsername())
                .active(savedSurvey.isActive())
                .sections(savedSurvey.getSections().stream()
                        .map(SurveyResponse.SurveySectionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .conditions(savedSurvey.getConditions().stream()
                        .map(SurveyResponse.SurveyConditionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<SurveySummaryResponse> getSurveySummary() {
        List<Survey> surveys = surveyRepository.findTop2ByActiveTrueOrderByCreatedAtDesc();
        return surveys.stream()
                .map(survey -> {
                    SurveySummaryResponse response = new SurveySummaryResponse();
                    response.setSurveyId(survey.getId());
                    response.setSurveyTitle(survey.getTitle());
                    response.setDescription(survey.getDescription());
                    response.setSurveyImage(survey.getSurveyImage());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public SurveyResponse getSurveyDetails(Long surveyId) {
    Survey survey = surveyRepository.findById(surveyId)
            .orElseThrow(() -> new RuntimeException("Survey not found"));
        return SurveyResponse.builder()
                .id(survey.getId())
                .title(survey.getTitle())
                .image(survey.getSurveyImage())
                .description(survey.getDescription())
                .createdAt(survey.getCreatedAt())
                .creator(survey.getCreatedBy().getUsername())
                .active(survey.isActive())
                .sections(survey.getSections().stream()
                        .map(SurveyResponse.SurveySectionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .conditions(survey.getConditions().stream()
                        .map(SurveyResponse.SurveyConditionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }
}
