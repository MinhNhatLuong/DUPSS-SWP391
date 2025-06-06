package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.BlogRequest;
import com.dupss.app.BE_Dupss.dto.response.BlogResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface BlogService {
    BlogResponse createBlog(BlogRequest blogRequest) throws IOException;
    List<BlogResponse> getBlogsByAuthor(String authorName);
    BlogResponse getBlogById(Long id);
    List<BlogResponse> getCreatedBlogs();
}