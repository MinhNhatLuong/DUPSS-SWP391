package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveySummaryResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyManagerResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResultResponse;
import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Survey;
import com.dupss.app.BE_Dupss.entity.SurveyCondition;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SurveyService {
    SurveyResponse createSurvey(SurveyCreateRequest surveyCreateRequest, MultipartFile coverImage) throws IOException;
    List<SurveySummaryResponse> getSurveySummary();
    SurveyResponse getSurveyDetails(Long surveyId);
    SurveyResultResponse submitSurveyResult(SurveyResultRequest request);
    List<SurveyResultResponse> getSubmittedSurveys();
    Survey createAndSaveSurveyEntity(SurveyCreateRequest request, MultipartFile coverImage, User author) throws IOException;
    List<SurveyManagerResponse> getAllSurveys();
    List<SurveyManagerResponse> getSurveysByAuthor();
    SurveyResponse getSurveyById(Long id);
    SurveyResultResponse submitSurvey(Long surveyId, SurveyResultRequest request);
    boolean evaluate(int score, SurveyCondition condition);
    void updateStatus(ApprovalStatus status, Long surveyId);
    List<SurveyResponse> getPendingSurveys();
}
