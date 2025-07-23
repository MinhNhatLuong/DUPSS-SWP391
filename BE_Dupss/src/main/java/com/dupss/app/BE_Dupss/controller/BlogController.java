package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.BlogRequest;
import com.dupss.app.BE_Dupss.dto.response.BlogResponse;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.service.BlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
@Slf4j
public class BlogController {

    private final BlogService blogService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_MANAGER')")
    public ResponseEntity<BlogResponse> createBlog(
            @ModelAttribute @Valid BlogRequest blogRequest) throws IOException {
        log.info("Creating blog with title: {}", blogRequest.getTitle());
        BlogResponse blogResponse = blogService.createBlog(blogRequest);
        return new ResponseEntity<>(blogResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable Long id) {
        log.info("Fetching blog with id: {}", id);
        BlogResponse blogResponse = blogService.getBlogById(id);
        return ResponseEntity.ok(blogResponse);
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<BlogResponse>> getBlogsByAuthor(@PathVariable String authorId) {
        log.info("Fetching blogs for author id: {}", authorId);
        List<BlogResponse> blogResponses = blogService.getBlogsByAuthor(authorId);
        return ResponseEntity.ok(blogResponses);
    }


    @GetMapping("/my-blogs")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_MANAGER')")
    public ResponseEntity<List<BlogResponse>> getMyBlogs() {
        List<BlogResponse> blogResponses = blogService.getCreatedBlogs();
        return ResponseEntity.ok(blogResponses);
    }

}