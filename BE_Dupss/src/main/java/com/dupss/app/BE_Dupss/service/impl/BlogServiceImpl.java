package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.BlogRequest;
import com.dupss.app.BE_Dupss.dto.response.BlogManagerResponse;
import com.dupss.app.BE_Dupss.dto.response.BlogSummaryResponse;
import com.dupss.app.BE_Dupss.dto.response.BlogResponse;
import com.dupss.app.BE_Dupss.entity.*;

import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.BlogService;

import com.dupss.app.BE_Dupss.service.CloudinaryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final TopicRepo topicRepository;
    private final ActionLogRepo actionLogRepo;

    @Override
    @Transactional
    public BlogResponse createBlog(BlogRequest blogRequest) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User author = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create new blog
        Blog blog = new Blog();
        blog.setTitle(blogRequest.getTitle());
        blog.setDescription(blogRequest.getDescription());
        blog.setContent(blogRequest.getContent());
        blog.setAuthor(author);
        blog.setStatus(ApprovalStatus.PENDING);
        blog.setActive(true);
        Topic topic = topicRepository.findByIdAndActive(blogRequest.getTopicId(), true);
        if(topic == null) {
            throw new EntityNotFoundException("Topic không được tìm thấy với id: " + blogRequest.getTopicId());
        }

        blog.setTopic(topic);
        // Save blog to get ID
        Blog savedBlog = blogRepository.save(blog);

        // Handle images if provided
//        List<BlogImage> blogImages = new ArrayList<>();
//        List<String> imageUrls = new ArrayList<>();
//        if (blogRequest.getImages() != null && !blogRequest.getImages().isEmpty()) {
//            for (MultipartFile imageFile : blogRequest.getImages()) {
//                if (!imageFile.isEmpty()) {
//                    // Upload to Cloudinary
//                    String imageUrl = cloudinaryService.uploadFile(imageFile);
//                    imageUrls.add(imageUrl);
//
//                    // Create and save BlogImage entity
//                    BlogImage blogImage = new BlogImage();
//                    blogImage.setImageUrl(imageUrl);
//                    blogImage.setBlogPost(savedBlog);
//                    blogImages.add(blogImage);
//                }
//            }
//        }

        if (blogRequest.getCoverImage() != null && !blogRequest.getCoverImage().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(blogRequest.getCoverImage());
            blog.setCoverImage(imageUrl);
        }
        blogRepository.save(savedBlog);

        // Prepare response
        return mapToResponse(savedBlog, author.getFullname());
    }

    @Override
    public List<BlogResponse> getBlogsByAuthor(String authorName) {

        User author = userRepository.findByUsernameAndEnabledTrue(authorName)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Blog> blogs = blogRepository.findByAuthor(author);
        return blogs.stream()
                .map(blog -> {
                    return mapToResponse(blog, author.getFullname());
                })
                .collect(Collectors.toList());
    }

    @Override
    public BlogResponse getBlogById(Long id) {

        Blog blog = blogRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found with id: " + id));

        User author = userRepository.findByUsername(blog.getAuthor().getUsername())
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + blog.getAuthor().getUsername()));

        return mapToResponse(blog, author.getFullname());
    }

    @Override
    public List<BlogResponse> getCreatedBlogs() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_STAFF && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only STAFF and MANAGER can view created courses");
        }

        List<Blog> blogs = blogRepository.findByAuthor(currentUser);

        return blogs.stream()
                .map(blog -> {
                    return mapToResponse(blog, currentUser.getFullname());
                })
                .collect(Collectors.toList());
    }


    public List<BlogSummaryResponse> getLatestBlogs() {
        return blogRepository.findTop3ByStatusOrderByCreatedAtDesc(ApprovalStatus.APPROVED)
                .stream()
                .map(blog -> {
                    BlogSummaryResponse res = new BlogSummaryResponse();
                    res.setId(blog.getId());
                    res.setTitle(blog.getTitle());
                    res.setTopic(blog.getTopic().getName());

//                    if (blog.getImages() != null && !blog.getImages().isEmpty()) {
//                        res.setCoverImage(blog.getImages().getFirst().getImageUrl());
//                    }
                    res.setCoverImage(blog.getCoverImage());

                    res.setSummary(blog.getDescription());
                    res.setCreatedAt(blog.getCreatedAt());
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<BlogManagerResponse> getBlogsPendingApproval() {
        List<Blog> blogs = blogRepository.findAllByStatusAndActiveTrue(ApprovalStatus.PENDING);
        return blogs.stream()
                .map(blog -> {
                    BlogManagerResponse res = new BlogManagerResponse();
                    res.setId(blog.getId());
                    res.setTitle(blog.getTitle());
                    res.setCoverImage(blog.getCoverImage());
                    res.setTopic(blog.getTopic().getName());
                    res.setDescription(blog.getDescription());
                    res.setContent(blog.getContent());
                    res.setCreatedAt(blog.getCreatedAt());
                    res.setAuthorName(blog.getAuthor().getFullname());
                    res.setStatus(blog.getStatus());
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<BlogManagerResponse> getAllBlogs() {
        List<Blog> blogs = blogRepository.findAllByActiveTrue();

        return blogs.stream()
                .map(blog -> {
                    Optional<ActionLog> optionalLog = actionLogRepo.findFirstByTargetTypeAndTargetIdAndActionType(
                            TargetType.BLOG, blog.getId(), ActionType.UPDATE);
                    BlogManagerResponse res = new BlogManagerResponse();
                    res.setId(blog.getId());
                    res.setTitle(blog.getTitle());
                    res.setTopic(blog.getTopic().getName());
                    res.setAuthorName(blog.getAuthor().getFullname());
                    res.setStatus(blog.getStatus());
                    res.setCreatedAt(blog.getCreatedAt());
                    res.setUpdatedAt(blog.getUpdatedAt());
                    optionalLog.ifPresent(log -> res.setCheckedBy(log.getPerformedBy().getFullname()));
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<BlogSummaryResponse> searchBlogs(String keyword, Long topic, Pageable pageable) {
        log.info("Searching blogs with keyword: {}, tags: {}", keyword, topic);

        Page<Blog> blogPage = blogRepository.search(keyword, topic, pageable);

        List<BlogSummaryResponse> blogResponses = blogPage.getContent().stream()
                .map(blog -> {
                    BlogSummaryResponse dto = new BlogSummaryResponse();
                    dto.setId(blog.getId());
                    dto.setTitle(blog.getTitle());
                    dto.setTopic(blog.getTopic().getName());
                    dto.setCreatedAt(blog.getCreatedAt());
                    dto.setSummary(blog.getDescription());
                    dto.setCoverImage(blog.getCoverImage());
//                    if (blog.getImages() != null && !blog.getImages().isEmpty()) {
//                        dto.setCoverImage(blog.getImages().getFirst().getImageUrl());
//                    }

                    return dto;
                }).collect(Collectors.toList());

        return new PageImpl<>(blogResponses, pageable, blogPage.getTotalElements());
    }

    @Override
    public void updateStatus(Long id, ApprovalStatus status) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Blog blog = blogRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found with id: " + id));
        if(blog.getStatus().equals(ApprovalStatus.PENDING)) {
            blog.setStatus(status);
        } else {
            throw new RuntimeException("Blog đã được phê duyệt hoặc từ chối, không thể cập nhật trạng thái");
        }
        blogRepository.save(blog);

        ActionLog actionLog = ActionLog.builder()
                .performedBy(currentUser)
                .actionType(ActionType.UPDATE)
                .targetType(TargetType.BLOG)
                .targetId(blog.getId())
                .actionTime(blog.getUpdatedAt())
                .build();
        actionLogRepo.save(actionLog);
    }

    private BlogResponse mapToResponse(Blog blog, String authorName) {
        return BlogResponse.builder()
                .id(blog.getId())
                .title(blog.getTitle())
                .topic(blog.getTopic().getName())
                .description(blog.getDescription())
                .content(blog.getContent())
                .imageUrl(blog.getCoverImage())
                .authorName(authorName)
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .status(blog.getStatus())
                .build();
    }
}