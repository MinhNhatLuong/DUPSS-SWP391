package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveySummaryResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyManagerResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResultResponse;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.CloudinaryService;
import com.dupss.app.BE_Dupss.service.SurveyService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SurveyServiceImpl implements SurveyService {

    private final SurveyRepo surveyRepository;
    private final SurveyResultRepo surveyResultRepository;
    private final SurveyOptionRepo surveyOptionRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;


    @Override
    public SurveyResponse createSurvey(SurveyCreateRequest request, MultipartFile coverImage) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User author = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Survey savedSurvey = createAndSaveSurveyEntity(request, coverImage, author);
        return SurveyResponse.builder()
                .id(savedSurvey.getId())
                .title(savedSurvey.getTitle())
                .surveyImage(savedSurvey.getSurveyImage())
                .active(savedSurvey.isActive())
                .createdAt(savedSurvey.getCreatedAt())
                .sections(savedSurvey.getSections().stream()
                        .map(SurveyResponse.SurveySectionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .conditions(savedSurvey.getConditions().stream()
                        .map(SurveyResponse.SurveyConditionDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public Survey createAndSaveSurveyEntity(SurveyCreateRequest request, MultipartFile coverImage, User author) throws IOException {

        Survey survey = new Survey();
        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());
        survey.setCreatedBy(author);
        survey.setActive(true);
        survey.setForCourse(false);
        survey.setCreatedAt(LocalDateTime.now());
        survey.setStatus(ApprovalStatus.PENDING); // Đặt trạng thái mặc định là PENDING

        if (coverImage != null && !coverImage.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(coverImage);
            survey.setSurveyImage(imageUrl);
        }

        List<SurveySection> sectionList = new ArrayList<>();
        for (SurveyCreateRequest.SurveySection sectionRequest : request.getSections()) {
            SurveySection section = new SurveySection();
            section.setSectionName(sectionRequest.getSectionName());
            section.setSurvey(survey);
            section.setQuestions(new ArrayList<>());

            for (SurveyCreateRequest.SurveySection.QuestionRequest questionRequest : sectionRequest.getQuestions()) {
                SurveyQuestion question = new SurveyQuestion();
                question.setQuestionText(questionRequest.getQuestionText());
                question.setSection(section);
                question.setOptions(new ArrayList<>());

                for (SurveyCreateRequest.SurveySection.OptionRequest optionRequest : questionRequest.getOptions()) {
                        SurveyOption option = new SurveyOption();
                    option.setOptionText(optionRequest.getOptionText());
                    option.setScore(optionRequest.getScore());
                        option.setQuestion(question);
                    question.getOptions().add(option);
                }
                section.getQuestions().add(question);
            }
            sectionList.add(section);
        }
        survey.setSections(sectionList);

        List<SurveyCondition> conditions = new ArrayList<>();
        for (SurveyCreateRequest.ConditionRequest conditionRequest : request.getConditions()) {
                SurveyCondition condition = new SurveyCondition();
            condition.setOperator(conditionRequest.getOperator());
            condition.setValue(conditionRequest.getValue());
            condition.setMessage(conditionRequest.getMessage());
                condition.setSurvey(survey);
            conditions.add(condition);
        }
        survey.setConditions(conditions);

        return surveyRepository.save(survey);

    }

    @Override
    public List<SurveySummaryResponse> getSurveySummary() {
        List<Survey> surveys = surveyRepository.findAllByActiveTrueAndForCourseOrderByCreatedAtDesc(false);
        return surveys.stream()
                .map(survey -> {
                    SurveySummaryResponse response = new SurveySummaryResponse();
                    response.setSurveyId(survey.getId());
                    response.setSurveyTitle(survey.getTitle());
                    response.setDescription(survey.getDescription());
                    response.setSurveyImage(survey.getSurveyImage());
                    response.setForCourse(survey.isForCourse());
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
                .surveyImage(survey.getSurveyImage())
                .description(survey.getDescription())
                .createdAt(survey.getCreatedAt())
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

        User user = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Survey survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found"));


        List<SurveyOption> selectedOptions = surveyOptionRepository.findAllById(request.getSelectedOptionIds());
        int userScore = selectedOptions.stream().mapToInt(SurveyOption::getScore).sum();

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

        User user = userRepository.findByUsernameAndEnabledTrue(username)
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
                .submittedAt(result.getSubmittedAt())
                .build();
    }

    @Override
    public boolean evaluate(int score, SurveyCondition condition) {
        return switch (condition.getOperator()) {
            case "=" -> score == condition.getValue();
            case ">" -> score > condition.getValue();
            case "<" -> score < condition.getValue();
            case ">=" -> score >= condition.getValue();
            case "<=" -> score <= condition.getValue();
            default -> false;
        };
    }

    @Override
    public void updateStatus(ApprovalStatus status, Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát với ID: " + surveyId));
        if(survey.getStatus().equals(ApprovalStatus.PENDING)) {
            survey.setStatus(status);
        } else {
            throw new RuntimeException("Khảo sát đã được phê duyệt hoặc từ chối, không thể cập nhật trạng thái");
        }
//        survey.setCheckedBy(currentUser);
        surveyRepository.save(survey);
    }

    @Override
    public List<SurveyResponse> getPendingSurveys() {
        List<Survey> surveys = surveyRepository.findByStatusAndActiveTrueAndForCourseFalse(ApprovalStatus.PENDING);
        return surveys.stream()
                .map(this::convertToSurveyResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SurveyResponse> getAllSurveys() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && 
                                 !authentication.getName().equals("anonymousUser");
        
        List<Survey> surveys;
        if (isAuthenticated) {
            // Lấy thông tin người dùng hiện tại
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username).orElse(null);
            
            // Nếu là STAFF, MANAGER hoặc ADMIN, hiển thị tất cả khảo sát
            if (currentUser != null && (currentUser.getRole() == ERole.ROLE_STAFF || 
                                       currentUser.getRole() == ERole.ROLE_MANAGER )){
                surveys = surveyRepository.findAllByActiveTrueAndForCourseOrderByCreatedAtDesc(false);
            } else {
                // Nếu là người dùng thông thường, chỉ hiển thị khảo sát đã được phê duyệt
                surveys = surveyRepository.findAll().stream()
                        .filter(survey -> survey.isActive() && !survey.isForCourse() && 
                                         survey.getStatus() == ApprovalStatus.APPROVED)
                        .collect(Collectors.toList());
            }
        } else {
            // Nếu chưa đăng nhập, chỉ hiển thị khảo sát đã được phê duyệt
            surveys = surveyRepository.findAll().stream()
                    .filter(survey -> survey.isActive() && !survey.isForCourse() && 
                                     survey.getStatus() == ApprovalStatus.APPROVED)
                    .collect(Collectors.toList());
        }
        
        return surveys.stream()
                .map(this::convertToSurveyResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SurveyManagerResponse> getSurveysByAuthor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Survey> surveys = surveyRepository.findByCreatedBy(currentUser);
        return surveys.stream()
                .map(survey -> SurveyManagerResponse.builder()
                        .surveyId(survey.getId())
                        .surveyTitle(survey.getTitle())
                        .description(survey.getDescription())
                        .surveyImage(survey.getSurveyImage())
                        .active(survey.isActive())
                        .forCourse(survey.isForCourse())
                        .createdAt(survey.getCreatedAt())
                        .createdBy(survey.getCreatedBy().getFullname())
                        .status(survey.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public SurveyResponse getSurveyById(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && 
                                 !authentication.getName().equals("anonymousUser");
        
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found with id: " + id));
        
        // Kiểm tra quyền truy cập
        if (!isAuthenticated) {
            // Nếu chưa đăng nhập, chỉ cho phép xem khảo sát đã được phê duyệt
            if (survey.getStatus() != ApprovalStatus.APPROVED) {
                throw new RuntimeException("Bạn không có quyền xem khảo sát này");
            }
        } else {
            // Nếu đã đăng nhập, kiểm tra vai trò
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username).orElse(null);
            
            if (currentUser != null) {
                // Nếu không phải STAFF, MANAGER hoặc ADMIN và không phải người tạo khảo sát
                if (currentUser.getRole() != ERole.ROLE_STAFF && 
                    currentUser.getRole() != ERole.ROLE_MANAGER &&
                    !Objects.equals(survey.getCreatedBy().getId(), currentUser.getId())) {
                    
                    // Chỉ cho phép xem khảo sát đã được phê duyệt
                    if (survey.getStatus() != ApprovalStatus.APPROVED) {
                        throw new RuntimeException("Bạn không có quyền xem khảo sát này");
                    }
                }
            }
        }
        
        return convertToSurveyResponse(survey);
    }
    
    // Phương thức chuyển đổi từ entity sang DTO
    private SurveyResponse convertToSurveyResponse(Survey survey) {
        return SurveyResponse.builder()
                .id(survey.getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .surveyImage(survey.getSurveyImage())
                .active(survey.isActive())
                .forCourse(survey.isForCourse())
                .createdAt(survey.getCreatedAt())
                .sections(survey.getSections().stream()
                        .map(section -> SurveyResponse.SurveySectionDTO.builder()
                                .id(section.getId())
                                .sectionName(section.getSectionName())
                                .questions(section.getQuestions().stream()
                                        .map(question -> SurveyResponse.SurveyQuestionDTO.builder()
                                                .id(question.getId())
                                                .questionText(question.getQuestionText())
                                                .options(question.getOptions().stream()
                                                        .map(option -> SurveyResponse.SurveyOptionDTO.builder()
                                                                .id(option.getId())
                                                                .optionText(option.getOptionText())
                                                                .score(option.getScore())
                                                                .build())
                                                        .collect(Collectors.toList()))
                                                .build())
                                        .collect(Collectors.toList()))
                                .build())
                        .collect(Collectors.toList()))
                .conditions(survey.getConditions().stream()
                        .map(condition -> SurveyResponse.SurveyConditionDTO.builder()
                                .operator(condition.getOperator())
                                .value(condition.getValue())
                                .message(condition.getMessage())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public SurveyResultResponse submitSurvey(Long surveyId, SurveyResultRequest request) {
        // Lấy thông tin người dùng hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Lấy thông tin khảo sát
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found with id: " + surveyId));
        
        // Kiểm tra khảo sát có được phê duyệt không
        if (survey.getStatus() != ApprovalStatus.APPROVED) {
            throw new RuntimeException("Khảo sát này chưa được phê duyệt");
        }
        
        // Tạo kết quả khảo sát
        SurveyResult result = new SurveyResult();
        result.setUser(currentUser);
        result.setSurvey(survey);
        result.setSubmittedAt(LocalDateTime.now());
        
        // Lưu kết quả
        SurveyResult savedResult = surveyResultRepository.save(result);
        
        // Trả về response
        SurveyResultResponse response = new SurveyResultResponse();
        response.setSubmittedAt(savedResult.getSubmittedAt());
        response.setTotalScore(savedResult.getTotalScore());
        response.setAdvice(savedResult.getAdvice());
        
        return response;
    }
}
