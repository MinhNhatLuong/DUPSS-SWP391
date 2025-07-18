package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.BlogRequest;
import com.dupss.app.BE_Dupss.dto.response.BlogManagerResponse;
import com.dupss.app.BE_Dupss.dto.response.BlogSummaryResponse;
import com.dupss.app.BE_Dupss.dto.response.BlogResponse;
import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.List;

public interface BlogService {
    BlogResponse createBlog(BlogRequest blogRequest) throws IOException;
    List<BlogResponse> getBlogsByAuthor(String authorName);
    BlogResponse getBlogById(Long id);
    List<BlogResponse> getCreatedBlogs();
    List<BlogSummaryResponse> getLatestBlogs();
    List<BlogManagerResponse> getBlogsPendingApproval();
    List<BlogManagerResponse> getAllBlogs();
    Page<BlogSummaryResponse> searchBlogs(String keyword, Long topic, Pageable pageable);
    void updateStatus(Long id, ApprovalStatus status);
    void updateBlog(Long id, BlogRequest blogRequest) throws IOException;
    void deleteBlog(Long id);
}