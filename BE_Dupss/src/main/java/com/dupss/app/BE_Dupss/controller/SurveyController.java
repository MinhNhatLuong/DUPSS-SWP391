package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.response.SurveyResultResponse;
import com.dupss.app.BE_Dupss.service.SurveyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}

