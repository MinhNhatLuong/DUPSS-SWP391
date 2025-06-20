package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.response.SurveyResultResponse;
import com.dupss.app.BE_Dupss.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    @PostMapping("/results")
    @PreAuthorize("hasAnyAuthority('ROLE_MEMBER')")
    public ResponseEntity<SurveyResultResponse> submitSurvey(
            @RequestBody @Valid SurveyResultRequest request) {
        SurveyResultResponse response = surveyService.submitSurveyResult(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/results")
    public ResponseEntity<List<SurveyResultResponse>> getSurveyResultsByCurrentUser() {
        List<SurveyResultResponse> results = surveyService.getSubmittedSurveys();
        return ResponseEntity.ok(results);
    }
}

