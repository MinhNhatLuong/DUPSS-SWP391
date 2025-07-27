package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.response.SurveyResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResultResponse;
import com.dupss.app.BE_Dupss.service.SurveyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;
    private final ObjectMapper objectMapper;

    @PostMapping("/results")
    @PreAuthorize("isAuthenticated()")
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

//    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    @PreAuthorize("hasAuthority('ROLE_STAFF')")
//    public ResponseEntity<SurveyResponse> createSurvey(@Valid @RequestPart(value = "request") String request,                                                                                                  @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) throws IOException {
//        SurveyCreateRequest survey = objectMapper.readValue(request, SurveyCreateRequest.class);
//        SurveyResponse surveyResponse = surveyService.createSurvey(survey, coverImage);
//        return ResponseEntity.status(HttpStatus.CREATED).body(surveyResponse);
//    }

}

