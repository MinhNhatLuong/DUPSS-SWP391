package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SurveySummaryResponse;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/public")
@Slf4j
public class HomeController {

    private final CourseService courseService;
    private final BlogService blogService;
    private final SurveyService surveyService;
    private final CourseEnrollmentService courseEnrollmentService;
    private final ConsultantService consultantService;
    private final SlotService slotService;

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getAllCourses(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long topicId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        int pageIndex = page > 0 ? page - 1 : 0;
        int size = 6;
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(direction, sortBy));
//        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<CourseHomeResponse> coursePage;

            coursePage = courseService.searchCoursesSummary(keyword, topicId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("courses", coursePage.getContent());
        response.put("currentPage", coursePage.getNumber() + 1);
        response.put("totalItems", coursePage.getTotalElements());
        response.put("totalPages", coursePage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/latest")
    public ResponseEntity<List<CourseHomeResponse>> getLatestCourses() {
        List<CourseHomeResponse> latestCourses = courseService.getLastestCourses();
        return ResponseEntity.ok(latestCourses);
    }

    @GetMapping("/blogs/latest")
    public ResponseEntity<List<BlogSummaryResponse>> getLatestBlogs() {
        List<BlogSummaryResponse> latestBlogs = blogService.getLatestBlogs();
        return ResponseEntity.ok(latestBlogs);
    }

    @GetMapping("/blog/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable Long id) {
        log.info("Fetching blog with id: {}", id);
        BlogResponse blogResponse = blogService.getBlogById(id);
        return ResponseEntity.ok(blogResponse);
    }

    @GetMapping("/blogs")
    public ResponseEntity<Map<String, Object>> searchBlogs(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long topic,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.info("Searching blogs with keyword: {}, tags: {}", keyword, topic);

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        int pageIndex = page > 0 ? page - 1 : 0;
        int size = 6; // Default page size
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(direction, sortBy));
        Page<BlogSummaryResponse> blogPage = blogService.searchBlogs(keyword, topic, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("blogs", blogPage.getContent());
        response.put("currentPage", blogPage.getNumber() + 1);
        response.put("totalItems", blogPage.getTotalElements());
        response.put("totalPages", blogPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/surveys/lastest")
    public ResponseEntity<List<SurveySummaryResponse>> getLastestSurveys() {
    List<SurveySummaryResponse> latestSurveys = surveyService.getSurveySummary();
        return ResponseEntity.ok(latestSurveys);
    }

    @GetMapping("/survey/{id}")
    public ResponseEntity<SurveyResponse> getSurveyDetail(@PathVariable Long id) {
        SurveyResponse surveyDetails = surveyService.getSurveyDetails(id);
        return ResponseEntity.ok(surveyDetails);
    }

    @GetMapping("/course/{id}")
    public ResponseEntity<CourseDetailPublicResponse> getCourseDetailPublic(@PathVariable Long id) {
        CourseDetailPublicResponse response = courseService.getCoursePublicDetail(id);
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/course/{id}/cert/{userId}")
    public ResponseEntity<?> getCertificate(@PathVariable Long id, @PathVariable Long userId) {
        try {
            CertificateResponse certRes = courseEnrollmentService.getCertificateResponse(id, userId);
            return ResponseEntity.ok(certRes);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/consultants/available")
    public ResponseEntity<List<ConsultantResponse>> getAvailableConsultants() {
        List<ConsultantResponse> consultants = consultantService.getAllConsultants();
        return ResponseEntity.ok(consultants);
    }

    @GetMapping("/slots/consultant/{consultantId}")
    public ResponseEntity<List<SlotResponseDto>> getSlotsByConsultantIdAndDate(@PathVariable Long consultantId, @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate date) {
        if(date == null) {
            date = LocalDate.now();
        }
        List<SlotResponseDto> res = slotService.getAvailableSlotsByConsultantAndDate(consultantId, date);
        return ResponseEntity.ok(res);
    }

}
