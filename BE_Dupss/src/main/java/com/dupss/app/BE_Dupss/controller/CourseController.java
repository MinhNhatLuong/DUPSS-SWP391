package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.CourseCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseUpdateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.entity.Certificate;
import com.dupss.app.BE_Dupss.service.CourseEnrollmentService;
import com.dupss.app.BE_Dupss.service.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseEnrollmentService enrollmentService;
    private final CourseEnrollmentService courseEnrollmentService;
//    private final ObjectMapper objectMapper;


    @GetMapping("/detail/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_MANAGER')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @ModelAttribute CourseCreateRequest request) throws IOException {
        CourseResponse response = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/created")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<CourseResponse>> getCreatedCourses() {
        return ResponseEntity.ok(courseService.getCreatedCourses());
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> enrollCourse(@Valid @PathVariable("courseId") Long id) {
        try {
            CourseEnrollmentResponse response = enrollmentService.enrollCourse(id);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException | MessagingException | UnsupportedEncodingException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/enrolled")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CourseEnrollmentResponse>> getEnrolledCourses() {
        return ResponseEntity.ok(enrollmentService.getEnrolledCourses());
    }

    @PostMapping("/videos/watched/{videoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markVideoWatched(@PathVariable Long videoId, @RequestParam boolean watched) throws MessagingException, UnsupportedEncodingException {
        courseEnrollmentService.markVideoAsWatched(videoId, watched);
        return ResponseEntity.ok("Video watched status and progress updated");
    }

    @PostMapping("/{courseId}/quiz/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizResultResponse> submitFinalQuiz(@PathVariable Long courseId, @RequestBody SurveyResultRequest request) throws MessagingException, UnsupportedEncodingException {
        QuizResultResponse res = courseEnrollmentService.submitCourseQuiz(courseId, request);
        return ResponseEntity.ok(res);
    }
    
    @PutMapping("/enrolled/{enrollmentId}/progress")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<?> updateProgress(
            @PathVariable Long enrollmentId,
            @RequestParam Double progress) {
        try {
            CourseEnrollmentResponse response = enrollmentService.updateProgress(enrollmentId, progress);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_MANAGER')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @ModelAttribute CourseUpdateRequest request) {
        try {
            CourseResponse response = courseService.updateCourse(id, request);
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (RuntimeException | IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 