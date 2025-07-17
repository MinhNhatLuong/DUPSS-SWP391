package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.TopicRequest;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.BlogRepository;
import com.dupss.app.BE_Dupss.respository.CourseRepository;
import com.dupss.app.BE_Dupss.respository.SurveyRepo;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.*;
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
    private final SurveyRepo surveyRepository;
    private final AppointmentService appointmentService;
    private final ActionLogService actionLogService;


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
        List<CourseManagerResponse> responses = courseService.getAllCourses();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/course/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse courseResponse = courseService.getCourseDetail(id);
        return ResponseEntity.ok(courseResponse);
    }

    /**
     * API lấy tất cả bài viết trong hệ thống
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/blogs/all")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<BlogManagerResponse>> getAllBlogs() {
        List<BlogManagerResponse> responses = blogService.getAllBlogs();
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
//                        .checkedBy(survey.getCheckedBy() != null ? survey.getCheckedBy().getFullname() : null)
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }


    /**
     * API lấy tất cả khóa học đang chờ phê duyệt
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/courses/pending")
    public ResponseEntity<List<CourseResponse>> getPendingCourses() {
        List<CourseResponse> responses = courseService.getCoursePending();
        return ResponseEntity.ok(responses);
    }

    /**
     * API lấy tất cả bài viết đang chờ phê duyệt
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/blogs/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER')")
    public ResponseEntity<List<BlogManagerResponse>> getPendingBlogs() {
        List<BlogManagerResponse> responses = blogService.getBlogsPendingApproval();
        return ResponseEntity.ok(responses);
    }

    /**
     * API lấy tất cả khảo sát đang chờ phê duyệt
     * Chỉ dành cho Manager và Admin
     */
    @GetMapping("/surveys/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER')")
    public ResponseEntity<List<SurveyResponse>> getPendingSurveys() {
        List<SurveyResponse> responses = surveyService.getPendingSurveys();
        return ResponseEntity.ok(responses);
    }

    /**
     * API phê duyệt khóa học
     * Chỉ dành cho Manager và Admin
     */
    @PatchMapping("/course/{id}/approval")
    public ResponseEntity<?> approvalCourse(@PathVariable Long id, @RequestParam("status") ApprovalStatus status) {
        String message = "";
        if(status.equals(ApprovalStatus.APPROVED)) {
            message = "Khóa học đã được phê duyệt thành công";
        } else if(status.equals(ApprovalStatus.REJECTED)) {
            message = "Khóa học đã bị từ chối";
        } else {
            message = "Trạng thái không hợp lệ";
            return ResponseEntity.badRequest().body(message);
        }
        courseService.updateStatus(id, status);
        return ResponseEntity.ok(message);

    }

//    @PatchMapping("/surveys/{id}/approve")
//    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
//    public ResponseEntity<?> approveSurvey(@PathVariable Long id) {
//        Survey survey = surveyRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát với ID: " + id));
//
//        // Lấy thông tin người dùng hiện tại
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String username = authentication.getName();
//        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));
//
//        survey.setStatus(ApprovalStatus.APPROVED);
////        survey.setCheckedBy(currentUser);
//        surveyRepository.save(survey);
//        return ResponseEntity.ok(Map.of("message", "Khảo sát đã được phê duyệt thành công"));
//    }
//
//    /**
//     * API từ chối khảo sát
//     * Chỉ dành cho Manager và Admin
//     */
//    @PatchMapping("/surveys/{id}/reject")
//    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
//    public ResponseEntity<?> rejectSurvey(@PathVariable Long id) {
//        Survey survey = surveyRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát với ID: " + id));
//
//        // Lấy thông tin người dùng hiện tại
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String username = authentication.getName();
//        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));
//
//        survey.setStatus(ApprovalStatus.REJECTED);
////        survey.setCheckedBy(currentUser);
//        surveyRepository.save(survey);
//        return ResponseEntity.ok(Map.of("message", "Khảo sát đã bị từ chối"));
//    }

    @PatchMapping("/surveys/{id}/approval")
    public ResponseEntity<String> approvalSurvey(@PathVariable Long id, @RequestParam("status") ApprovalStatus status) {
        String message = "";
        if(status.equals(ApprovalStatus.APPROVED)) {
            message = "Khảo sát đã được phê duyệt thành công";
        } else if(status.equals(ApprovalStatus.REJECTED)) {
            message = "Khảo sát đã bị từ chối";
        } else {
            message = "Trạng thái không hợp lệ";
            return ResponseEntity.badRequest().body(message);
        }
        surveyService.updateStatus(status, id);
        return ResponseEntity.ok(message);
    }

    @PatchMapping("/blog/{id}/approval")
    public ResponseEntity<String> approvalBlog(@PathVariable Long id, @RequestParam("status") ApprovalStatus status) {
        String message = "";
        if(status.equals(ApprovalStatus.APPROVED)) {
            message = "Khảo sát đã được phê duyệt thành công";
        } else if(status.equals(ApprovalStatus.REJECTED)) {
            message = "Khảo sát đã bị từ chối";
        } else {
            message = "Trạng thái không hợp lệ";
            return ResponseEntity.badRequest().body(message);
        }
        blogService.updateStatus(id, status);
        return ResponseEntity.ok(message);
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

//    @PostMapping(value = "/survey", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    @PreAuthorize("hasAuthority('ROLE_STAFF, ROLE_MANAGER')")
//    public ResponseEntity<SurveyResponse> createSurvey(@Valid @ModelAttribute SurveyCreateRequest request) throws IOException {
//        SurveyResponse surveyResponse = surveyService.createSurvey(request);
//        return ResponseEntity.status(HttpStatus.CREATED).body(surveyResponse);
//    }
}