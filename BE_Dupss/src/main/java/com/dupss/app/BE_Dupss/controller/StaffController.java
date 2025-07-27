package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.BlogRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseUpdateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.response.BlogResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyManagerResponse;
import com.dupss.app.BE_Dupss.dto.response.SurveyResponse;
import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Blog;
import com.dupss.app.BE_Dupss.entity.Survey;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.BlogRepository;
import com.dupss.app.BE_Dupss.respository.SurveyRepo;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.BlogService;
import com.dupss.app.BE_Dupss.service.CourseService;
import com.dupss.app.BE_Dupss.service.SurveyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final SurveyService surveyService;
    private final CourseService courseService;
    private final BlogService blogService;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final SurveyRepo surveyRepository;
    private final ObjectMapper objectMapper;


    
    /**
     * API lấy tất cả khảo sát của Staff hiện tại
     */
    @GetMapping("/surveys")
    public ResponseEntity<List<SurveyManagerResponse>> getMySurveys() {
        List<SurveyManagerResponse> responses = surveyService.getSurveysByAuthor();
        return ResponseEntity.ok(responses);
    }
    
    /**
     * API tạo bài viết mới
     * Chỉ dành cho Staff
     */
    @PostMapping(value = "/blog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BlogResponse> createBlog(@Valid @ModelAttribute BlogRequest request) throws IOException {
        BlogResponse blogResponse = blogService.createBlog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(blogResponse);
    }
    
    /**
     * API lấy tất cả bài viết của Staff hiện tại
     */
    @GetMapping("/blogs")
    public ResponseEntity<List<BlogResponse>> getMyBlogs() {
        List<BlogResponse> blogResponses = blogService.getCreatedBlogs();
        return ResponseEntity.ok(blogResponses);
    }

    @GetMapping("surveys/{id}")
    public ResponseEntity<SurveyResponse> getSurvey(@PathVariable Long id) {
        SurveyResponse surveyResponse = surveyService.getSurveyById(id);
        if (surveyResponse == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
        return ResponseEntity.ok(surveyResponse);
    }

    @GetMapping("blog/{id}")
    public ResponseEntity<BlogResponse> getBlog(@PathVariable Long id) {
        BlogResponse blogResponse = blogService.getBlogById(id);
        if (blogResponse == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
        return ResponseEntity.ok(blogResponse);
    }

    @GetMapping("course/{id}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        CourseResponse courseResponse = courseService.getCourseById(id);
        if (courseResponse == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
        return ResponseEntity.ok(courseResponse);
    }

    /**
     * API lấy tất cả khóa học của Staff hiện tại
     */
    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getMyCourses() {
        return ResponseEntity.ok(courseService.getCreatedCourses());
    }
    
    /**
     * API cập nhật bài viết
     * Staff chỉ có thể cập nhật bài viết của mình và chưa được phê duyệt
     */
    @PatchMapping(value = "/blog/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBlog(@PathVariable Long id, @Valid @ModelAttribute BlogRequest request) throws IOException {
        try {
            blogService.updateBlog(id, request);
            return ResponseEntity.ok(Map.of("message", "Bài viết đã được cập nhật thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/blog/delete/{blogId}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long blogId) {
        try {
            blogService.deleteBlog(blogId);
            return ResponseEntity.ok(Map.of("message", "Bài viết đã được xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }


    @PostMapping(value = "/course", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseResponse> createCourse(@Valid @ModelAttribute CourseCreateRequest request) throws IOException {
//        CourseCreateRequest request = objectMapper.readValue(rawJson, CourseCreateRequest.class);
        CourseResponse response = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * API cập nhật khóa học
     * Staff chỉ có thể cập nhật khóa học của mình và chưa được phê duyệt
     */
    @PatchMapping(value = "/course/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @ModelAttribute CourseUpdateRequest request) throws IOException {
        try {
            CourseResponse response = courseService.updateCourse(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/course/delete/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long courseId) {
        try {
            courseService.deleteCourse(courseId);
            return ResponseEntity.ok(Map.of("message", "Khóa học đã được xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }


    @PostMapping(value = "/survey", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SurveyResponse> createSurvey(@Valid @RequestPart(value = "request") String request,                                                                                                  @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) throws IOException {
        SurveyCreateRequest survey = objectMapper.readValue(request, SurveyCreateRequest.class);
        SurveyResponse surveyResponse = surveyService.createSurvey(survey, coverImage);
        return ResponseEntity.status(HttpStatus.CREATED).body(surveyResponse);
    }


    @PatchMapping(value = "/survey/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateSurvey(@PathVariable Long id, @Valid @RequestPart(value = "request") String request, @RequestPart(required = false) MultipartFile images) throws IOException {
        try{
            SurveyCreateRequest survey = objectMapper.readValue(request, SurveyCreateRequest.class);
            surveyService.updateSurvey(survey, id, images);
            return ResponseEntity.ok(Map.of("message", "Khảo sát đã được cập nhật thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/survey/delete/{surveyId}")
    public ResponseEntity<?> deleteSurvey(@PathVariable Long surveyId) {
        try {
            surveyService.deleteSurvey(surveyId);
            return ResponseEntity.ok(Map.of("message", "Khảo sát đã được xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}