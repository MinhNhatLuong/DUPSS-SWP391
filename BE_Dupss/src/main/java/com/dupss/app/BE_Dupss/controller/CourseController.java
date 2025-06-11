package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.CourseCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseEnrollmentRequest;
import com.dupss.app.BE_Dupss.dto.response.CourseEnrollmentResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseHomeResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseResponse;
import com.dupss.app.BE_Dupss.service.CourseEnrollmentService;
import com.dupss.app.BE_Dupss.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseEnrollmentService enrollmentService;


    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping
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

    @PostMapping("/enroll")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<?> enrollCourse(@Valid @RequestBody CourseEnrollmentRequest request) {
        try {
            CourseEnrollmentResponse response = enrollmentService.enrollCourse(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/enrolled")
    @PreAuthorize("hasAuthority('ROLE_MEMBER')")
    public ResponseEntity<List<CourseEnrollmentResponse>> getEnrolledCourses() {
        return ResponseEntity.ok(enrollmentService.getEnrolledCourses());
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
} 