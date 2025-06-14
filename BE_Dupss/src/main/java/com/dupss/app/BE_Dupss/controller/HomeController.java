package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.response.BlogHomeResponse;
import com.dupss.app.BE_Dupss.dto.response.BlogResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseHomeResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseResponse;
import com.dupss.app.BE_Dupss.service.BlogService;
import com.dupss.app.BE_Dupss.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getAllCourses(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String targetAudience,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<CourseHomeResponse> coursePage;
        if (targetAudience != null && !targetAudience.isEmpty()) {
            coursePage = courseService.searchCoursesByTargetAudience(keyword, targetAudience, pageable);
        } else {
            coursePage = courseService.searchCoursesSummary(keyword, pageable);
        }

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
    public ResponseEntity<List<BlogHomeResponse>> getLatestBlogs() {
        List<BlogHomeResponse> latestBlogs = blogService.getLatestBlogs();
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
            @RequestParam(required = false) String tags,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.info("Searching blogs with keyword: {}, tags: {}", keyword, tags);

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        int pageIndex = page > 0 ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(direction, sortBy));
        Page<BlogHomeResponse> blogPage = blogService.searchBlogs(keyword, tags, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("blogs", blogPage.getContent());
        response.put("currentPage", blogPage.getNumber() + 1);
        response.put("totalItems", blogPage.getTotalElements());
        response.put("totalPages", blogPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

}
