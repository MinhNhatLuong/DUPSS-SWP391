package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.BlogRequest;
import com.dupss.app.BE_Dupss.dto.response.BlogHomeResponse;
import com.dupss.app.BE_Dupss.dto.response.BlogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface BlogService {
    BlogResponse createBlog(BlogRequest blogRequest) throws IOException;
    List<BlogResponse> getBlogsByAuthor(String authorName);
    BlogResponse getBlogById(Long id);
    List<BlogResponse> getCreatedBlogs();
    List<BlogHomeResponse> getLatestBlogs();
    Page<BlogHomeResponse> searchBlogs(String keyword, Long topic, Pageable pageable);
}