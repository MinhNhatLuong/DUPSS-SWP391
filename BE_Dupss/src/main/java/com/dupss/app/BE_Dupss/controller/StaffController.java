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

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Map<String, String>> getStaffDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Staff Dashboard",
                "role", "STAFF"
        ));
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> createTask() {
        // Implement task creation logic here
        return ResponseEntity.ok(Map.of("message", "Task created successfully"));
    }
    
    /**
     * API tạo khảo sát mới
     * Chỉ dành cho Staff
     */

    
    /**
     * API lấy tất cả khảo sát của Staff hiện tại
     */
    @GetMapping("/surveys")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<List<SurveyManagerResponse>> getMySurveys() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Survey> surveys = surveyRepository.findByCreatedBy(currentUser);
        List<SurveyManagerResponse> responses = surveys.stream()
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
        return ResponseEntity.ok(responses);
    }
    
    /**
     * API tạo bài viết mới
     * Chỉ dành cho Staff
     */
    @PostMapping(value = "/blog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<BlogResponse> createBlog(@Valid @ModelAttribute BlogRequest request) throws IOException {
        BlogResponse blogResponse = blogService.createBlog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(blogResponse);
    }
    
    /**
     * API lấy tất cả bài viết của Staff hiện tại
     */
    @GetMapping("/blogs")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<List<BlogResponse>> getMyBlogs() {
        List<BlogResponse> blogResponses = blogService.getCreatedBlogs();
        return ResponseEntity.ok(blogResponses);
    }
    
    /**
     * API tạo khóa học mới
     * Chỉ dành cho Staff
     */
//    @PostMapping(value = "/course", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    @PreAuthorize("hasAuthority('ROLE_STAFF')")
//    public ResponseEntity<CourseResponse> createCourse(@Valid @ModelAttribute CourseCreateRequest request) throws IOException {
//        CourseResponse response = courseService.createCourse(request, );
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }
    
    /**
     * API lấy tất cả khóa học của Staff hiện tại
     */
    @GetMapping("/courses")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<List<CourseResponse>> getMyCourses() {
        return ResponseEntity.ok(courseService.getCreatedCourses());
    }
    
    /**
     * API cập nhật bài viết
     * Staff chỉ có thể cập nhật bài viết của mình và chưa được phê duyệt
     */
    @PutMapping(value = "/blog/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<?> updateBlog(@PathVariable Long id, @Valid @ModelAttribute BlogRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
        
        // Kiểm tra xem người dùng có phải là tác giả của bài viết không
        if (!Objects.equals(blog.getAuthor().getId(), currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Bạn không có quyền cập nhật bài viết này"));
        }
        
        // Kiểm tra trạng thái của bài viết
        if (blog.getStatus() != ApprovalStatus.PENDING && blog.getStatus() != ApprovalStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Chỉ có thể cập nhật bài viết có trạng thái PENDING hoặc REJECTED"));
        }
        
        // Cập nhật bài viết
        blog.setTitle(request.getTitle());
        blog.setDescription(request.getDescription());
        blog.setContent(request.getContent());
        blog.setStatus(ApprovalStatus.PENDING); // Reset status to PENDING after update
        
        if (request.getTopicId() != null) {
            blog.getTopic().setId(request.getTopicId());
        }
        
        Blog updatedBlog = blogRepository.save(blog);
        
        return ResponseEntity.ok(Map.of("message", "Cập nhật bài viết thành công", "id", updatedBlog.getId().toString()));
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
    @PutMapping(value = "/course/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @ModelAttribute CourseUpdateRequest request) throws IOException {
        try {
            CourseResponse response = courseService.updateCourse(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * API cập nhật khảo sát
     * Staff chỉ có thể cập nhật khảo sát của mình và chưa được phê duyệt
     */
    @PutMapping(value = "/survey/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<?> updateSurvey(@PathVariable Long id, @Valid @ModelAttribute SurveyCreateRequest request, @RequestPart MultipartFile images) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát với ID: " + id));
        
        // Kiểm tra xem người dùng có phải là tác giả của khảo sát không
        if (!Objects.equals(survey.getCreatedBy().getId(), currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Bạn không có quyền cập nhật khảo sát này"));
        }
        
        // Kiểm tra trạng thái của khảo sát
        if (survey.getStatus() != ApprovalStatus.PENDING && survey.getStatus() != ApprovalStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Chỉ có thể cập nhật khảo sát có trạng thái PENDING hoặc REJECTED"));
        }
        
        // Cập nhật các thuộc tính cơ bản của khảo sát
        survey.setTitle(request.getTitle());
        survey.setDescription(request.getDescription());
        survey.setStatus(ApprovalStatus.PENDING); // Reset status to PENDING after update
        
        if (images != null && !images.isEmpty()) {
            // Xử lý upload hình ảnh nếu cần
        }
        
        Survey updatedSurvey = surveyRepository.save(survey);
        
        return ResponseEntity.ok(Map.of("message", "Cập nhật khảo sát thành công", "id", updatedSurvey.getId().toString()));
    }
}