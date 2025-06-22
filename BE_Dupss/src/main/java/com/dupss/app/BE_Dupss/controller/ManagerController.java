package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.TopicRequest;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Blog;
import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.Survey;
import com.dupss.app.BE_Dupss.respository.BlogRepository;
import com.dupss.app.BE_Dupss.respository.CourseRepository;
import com.dupss.app.BE_Dupss.respository.SurveyRepo;
import com.dupss.app.BE_Dupss.service.AdminService;
import com.dupss.app.BE_Dupss.service.BlogService;
import com.dupss.app.BE_Dupss.service.CourseService;
import com.dupss.app.BE_Dupss.service.SurveyService;
import com.dupss.app.BE_Dupss.service.TopicService;
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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final AdminService adminService;
    private final TopicService topicService;
    private final SurveyService surveyService;
    private final CourseService courseService;
    private final BlogService blogService;
    private final CourseRepository courseRepository;
    private final BlogRepository blogRepository;
    private final SurveyRepo surveyRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> getManagerDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Manager Dashboard",
                "role", "MANAGER"
        ));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public List<UserDetailResponse> getAllStaff() {
        return adminService.getUsersByRole("ROLE_STAFF");
    }

    @GetMapping("/consultants")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public List<UserDetailResponse> getAllConsultants() {
        return adminService.getUsersByRole("ROLE_CONSULTANT");
    }

    /**
     * API lấy tất cả khóa học trong hệ thống
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/courses/all")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<CourseManagerResponse>> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        List<CourseManagerResponse> responses = courses.stream()
                .map(course -> CourseManagerResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .coverImage(course.getCoverImage())
                        .content(course.getContent())
                        .duration(course.getDuration())
                        .status(course.getStatus())
                        .createdAt(course.getCreatedAt())
                        .updatedAt(course.getUpdatedAt())
                        .topicName(course.getTopic() != null ? course.getTopic().getName() : null)
                        .creatorName(course.getCreator() != null ? course.getCreator().getFullname() : null)
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * API lấy tất cả bài viết trong hệ thống
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/blogs/all")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<BlogManagerResponse>> getAllBlogs() {
        List<Blog> blogs = blogRepository.findAll();
        List<BlogManagerResponse> responses = blogs.stream()
                .map(blog -> BlogManagerResponse.builder()
                        .id(blog.getId())
                        .title(blog.getTitle())
                        .description(blog.getDescription())
                        .content(blog.getContent())
                        .createdAt(blog.getCreatedAt())
                        .updatedAt(blog.getUpdatedAt())
                        .status(blog.getStatus())
                        .tags(blog.getTags())
                        .topic(blog.getTopic() != null ? blog.getTopic().getName() : null)
                        .authorName(blog.getAuthor() != null ? blog.getAuthor().getFullname() : null)
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * API lấy tất cả khảo sát trong hệ thống
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/surveys/all")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<SurveyManagerResponse>> getAllSurveys() {
        List<Survey> surveys = surveyRepository.findAll();
        List<SurveyManagerResponse> responses = surveys.stream()
                .map(survey -> SurveyManagerResponse.builder()
                        .surveyId(survey.getId())
                        .surveyTitle(survey.getTitle())
                        .description(survey.getDescription())
                        .surveyImage(survey.getSurveyImage())
                        .active(survey.isActive())
                        .forCourse(survey.isForCourse())
                        .createdAt(survey.getCreatedAt())
                        .createdBy(survey.getCreatedBy() != null ? survey.getCreatedBy().getFullname() : null)
                        .status(survey.getStatus())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * API lấy tất cả khóa học đang chờ phê duyệt
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/courses/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<CourseManagerResponse>> getPendingCourses() {
        List<Course> courses = courseRepository.findByStatus(ApprovalStatus.PENDING);
        List<CourseManagerResponse> responses = courses.stream()
                .map(course -> CourseManagerResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .coverImage(course.getCoverImage())
                        .content(course.getContent())
                        .duration(course.getDuration())
                        .status(course.getStatus())
                        .createdAt(course.getCreatedAt())
                        .updatedAt(course.getUpdatedAt())
                        .topicName(course.getTopic() != null ? course.getTopic().getName() : null)
                        .creatorName(course.getCreator() != null ? course.getCreator().getFullname() : null)
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * API lấy tất cả bài viết đang chờ phê duyệt
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/blogs/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<BlogManagerResponse>> getPendingBlogs() {
        List<Blog> blogs = blogRepository.findByStatus(ApprovalStatus.PENDING);
        List<BlogManagerResponse> responses = blogs.stream()
                .map(blog -> BlogManagerResponse.builder()
                        .id(blog.getId())
                        .title(blog.getTitle())
                        .description(blog.getDescription())
                        .content(blog.getContent())
                        .createdAt(blog.getCreatedAt())
                        .updatedAt(blog.getUpdatedAt())
                        .status(blog.getStatus())
                        .tags(blog.getTags())
                        .topic(blog.getTopic() != null ? blog.getTopic().getName() : null)
                        .authorName(blog.getAuthor() != null ? blog.getAuthor().getFullname() : null)
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * API lấy tất cả khảo sát đang chờ phê duyệt
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/surveys/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<SurveyManagerResponse>> getPendingSurveys() {
        List<Survey> surveys = surveyRepository.findByStatus(ApprovalStatus.PENDING);
        List<SurveyManagerResponse> responses = surveys.stream()
                .map(survey -> SurveyManagerResponse.builder()
                        .surveyId(survey.getId())
                        .surveyTitle(survey.getTitle())
                        .description(survey.getDescription())
                        .surveyImage(survey.getSurveyImage())
                        .active(survey.isActive())
                        .forCourse(survey.isForCourse())
                        .createdAt(survey.getCreatedAt())
                        .createdBy(survey.getCreatedBy() != null ? survey.getCreatedBy().getFullname() : null)
                        .status(survey.getStatus())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * API phê duyệt khóa học
     * Chỉ dành cho Manager và Admin
     */
    @PatchMapping("/courses/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<?> approveCourse(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));
        course.setStatus(ApprovalStatus.APPROVED);
        courseRepository.save(course);
        return ResponseEntity.ok(Map.of("message", "Khóa học đã được phê duyệt thành công"));
    }

    /**
     * API từ chối khóa học
     * Chỉ dành cho Manager và Admin
     */
    @PatchMapping("/courses/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<?> rejectCourse(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));
        course.setStatus(ApprovalStatus.REJECTED);
        courseRepository.save(course);
        return ResponseEntity.ok(Map.of("message", "Khóa học đã bị từ chối"));
    }

    /**
     * API phê duyệt bài viết
     * Chỉ dành cho Manager và Admin
     */
    @PatchMapping("/blogs/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<?> approveBlog(@PathVariable Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
        blog.setStatus(ApprovalStatus.APPROVED);
        blogRepository.save(blog);
        return ResponseEntity.ok(Map.of("message", "Bài viết đã được phê duyệt thành công"));
    }

    /**
     * API từ chối bài viết
     * Chỉ dành cho Manager và Admin
     */
    @PatchMapping("/blogs/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<?> rejectBlog(@PathVariable Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
        blog.setStatus(ApprovalStatus.REJECTED);
        blogRepository.save(blog);
        return ResponseEntity.ok(Map.of("message", "Bài viết đã bị từ chối"));
    }

    /**
     * API phê duyệt khảo sát
     * Chỉ dành cho Manager và Admin
     */
    @PatchMapping("/surveys/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<?> approveSurvey(@PathVariable Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát với ID: " + id));
        survey.setStatus(ApprovalStatus.APPROVED);
        surveyRepository.save(survey);
        return ResponseEntity.ok(Map.of("message", "Khảo sát đã được phê duyệt thành công"));
    }

    /**
     * API từ chối khảo sát
     * Chỉ dành cho Manager và Admin
     */
    @PatchMapping("/surveys/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<?> rejectSurvey(@PathVariable Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát với ID: " + id));
        survey.setStatus(ApprovalStatus.REJECTED);
        surveyRepository.save(survey);
        return ResponseEntity.ok(Map.of("message", "Khảo sát đã bị từ chối"));
    }

    @PostMapping("/reports")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> generateReport() {
        // Implement report generation logic here
        return ResponseEntity.ok(Map.of("message", "Report generated successfully"));
    }

    @PostMapping("/topic")
    public ResponseEntity<TopicResponse> createTopic(@RequestBody TopicRequest topic) {
        TopicResponse topicRes = topicService.create(topic);
        return ResponseEntity.status(HttpStatus.CREATED).body(topicRes);
    }

    @PatchMapping("/topic/{id}")
    public ResponseEntity<TopicResponse> updateTopic(@PathVariable Long id, @RequestBody TopicRequest topic) {
        TopicResponse topicRes = topicService.update(id, topic);
        return ResponseEntity.ok(topicRes);
    }

    @PatchMapping("/topic/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.ok("Topic deleted successfully");
    }

    @PostMapping(value = "/survey", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_STAFF, ROLE_MANAGER')")
    public ResponseEntity<SurveyResponse> createSurvey(@Valid @ModelAttribute SurveyCreateRequest request) throws IOException {
        SurveyResponse surveyResponse = surveyService.createSurvey(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(surveyResponse);
    }
}