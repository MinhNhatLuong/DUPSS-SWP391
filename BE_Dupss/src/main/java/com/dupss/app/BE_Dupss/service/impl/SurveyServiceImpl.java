package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveySummaryResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResultResponse;
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
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyServiceImpl implements SurveyService {

    private final SurveyRepo surveyRepository;
    private final SurveyResultRepo surveyResultRepository;
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
                .title(savedSurvey.getTitle())
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
                .title(survey.getTitle())
                .sections(survey.getSections().stream()
                        .map(SurveyResponse.SurveySectionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .conditions(survey.getConditions().stream()
                        .map(SurveyResponse.SurveyConditionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public SurveyResultResponse submitSurveyResult(SurveyResultRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));


        List<SurveyOption> selectedOptions = surveyOptionRepository.findAllById(request.getSelectedOptionIds());
        int userScore = selectedOptions.stream().mapToInt(SurveyOption::getScore).sum();
//        int totalScore = survey.getSections().stream()
//                .flatMap(section -> section.getQuestions().stream())
//                .flatMap(question -> question.getOptions().stream())
//                .mapToInt(SurveyOption::getScore)
//                .sum();
        int totalScore = survey.getSections().stream()
                .flatMap(section -> section.getQuestions().stream())
                .mapToInt(question ->
                        question.getOptions().stream()
                                .mapToInt(SurveyOption::getScore)
                                .max()
                                .orElse(0) // Nếu không có option nào, coi điểm là 0
                )
                .sum();
        String advice = survey.getConditions().stream()
                .filter(c -> evaluate(userScore, c))
                .sorted(Comparator.comparing(SurveyCondition::getValue))
                .map(SurveyCondition::getMessage)
                .reduce((a, b) -> b).orElse("Không có lời khuyên phù hợp");

        SurveyResult result = new SurveyResult();
        result.setUser(user);
        result.setSurvey(survey);
        result.setScore(userScore);
        result.setTotalScore(totalScore);
        result.setAdvice(advice);
        result.setSubmittedAt(LocalDateTime.now());

        List<SurveyResultOption> resultOptions = selectedOptions.stream().map(option -> {
            SurveyResultOption sro = new SurveyResultOption();
            sro.setSurveyOption(option);
            sro.setSurveyResult(result);
            return sro;
        }).collect(Collectors.toList());

        result.setSelectedOptions(resultOptions);

        surveyResultRepository.save(result);

        return mapToSurveyResultResponse(result);
    }

    @Override
    public List<SurveyResultResponse> getSubmittedSurveys() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return surveyResultRepository.findByUser(user).stream()
                .map(this::mapToSurveyResultResponse)
                .collect(Collectors.toList());
    }

    private SurveyResultResponse mapToSurveyResultResponse(SurveyResult result) {

        return SurveyResultResponse.builder()
                .surveyName(result.getSurvey().getTitle())
                .totalScore(result.getTotalScore())
                .score(result.getScore())
                .advice(result.getAdvice())
                .build();
    }

    private boolean evaluate(int score, SurveyCondition condition) {
        return switch (condition.getOperator()) {
            case "=" -> score == condition.getValue();
            case ">" -> score > condition.getValue();
            case "<" -> score < condition.getValue();
            case ">=" -> score >= condition.getValue();
            case "<=" -> score <= condition.getValue();
            default -> false;
        };
    }
}
