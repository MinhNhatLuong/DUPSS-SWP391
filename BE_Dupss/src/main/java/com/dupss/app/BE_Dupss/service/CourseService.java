package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.CourseCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseModuleRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseUpdateRequest;
import com.dupss.app.BE_Dupss.dto.response.CourseHomeResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseModuleResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final TopicRepo topicRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_STAFF && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only STAFF and MANAGER can create courses");
        }

        //check topic
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found with ID: " + request.getTopicId()));
        
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setTopic(topic);
        course.setDescription(request.getDescription());
        course.setTargetAudience(request.getTargetAudience());
        course.setContent(request.getContent());
        course.setDuration(request.getDuration());
        course.setActive(true);
        course.setCreator(currentUser);
        course.setStatus(ApprovalStatus.PENDING);

        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(request.getCoverImage());
            course.setCoverImage(imageUrl);
        }

        Course savedCourse = courseRepository.save(course);
        log.info("Course created: {}", savedCourse.getTitle());

        // Create modules if provided
        List<CourseModule> modules = new ArrayList<>();
        if (request.getModules() != null && !request.getModules().isEmpty()) {
            for (CourseModuleRequest moduleRequest : request.getModules()) {
                CourseModule module = new CourseModule();
                module.setTitle(moduleRequest.getTitle());
                module.setContent(moduleRequest.getContent());
                module.setDuration(moduleRequest.getDuration());
                module.setOrderIndex(moduleRequest.getOrderIndex());
                module.setCourse(savedCourse);

                List<VideoCourse> videos = new ArrayList<>();
                if (moduleRequest.getVideos() != null) {
                    for (String url : moduleRequest.getVideos()) {
                        VideoCourse video = new VideoCourse();
                        video.setVideoUrl(url);
                        video.setCourseModule(module);
                        videos.add(video);
                    }
                }
                module.setVideos(videos);
                modules.add(module);

            }
            moduleRepository.saveAll(modules);
        }
        
        return mapToCourseResponse(savedCourse, modules, false);
    }


    public List<CourseHomeResponse> getLastestCourses() {
        List<Course> courses = courseRepository.findTop3ByIsActiveTrueAndStatusOrderByCreatedAtDesc(ApprovalStatus.APPROVED);

        return courses.stream()
                .map(course -> {
                    List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);
                    return CourseHomeResponse.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .coverImage(course.getCoverImage())
                            .summary(course.getDescription())
                            .createdAt(course.getCreatedAt())
                            .topicName(course.getTopic() != null ? course.getTopic().getName() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public Page<CourseHomeResponse> searchCoursesSummary(String keyword, Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        Page<Course> courses = courseRepository.searchCourses(keyword, pageable);
        return courses.map(course -> {
            boolean isEnrolled = false;
            if (currentUser != null) {
                isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
            }
            return mapToCourseHomeResponse(course, isEnrolled);
        });
    }
    
    public Page<CourseHomeResponse> searchCoursesByTargetAudience(String keyword, String targetAudience, Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsername(username).orElse(null);
        
        Page<Course> courses = courseRepository.searchCoursesByTargetAudience(keyword, targetAudience, pageable);
        
        return courses.map(course -> {
            List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);
            boolean isEnrolled = false;
            if (currentUser != null) {
                isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
            }
            return mapToCourseHomeResponse(course, isEnrolled);
        });
    }
    
    public CourseResponse getCourseById(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsername(username).orElse(null);
        
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        
        List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);
        
//        boolean isEnrolled = false;
//        if (currentUser != null) {
//            isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
//        }

        boolean isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
        boolean isOwner = course.getCreator() != null && course.getCreator().equals(currentUser.getId());

        if (!isEnrolled && !isOwner) {
            throw new AccessDeniedException("You are not authorized to view this course.");
        }
        
        return mapToCourseResponse(course, modules, isEnrolled);
    }
    
    public List<CourseResponse> getCreatedCourses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_STAFF && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only STAFF and MANAGER can view created courses");
        }
        
        List<Course> courses = courseRepository.findByCreator(currentUser);
        
        return courses.stream()
                .map(course -> {
                    List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);
                    return mapToCourseResponse(course, modules, false);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseUpdateRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_STAFF && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only STAFF and MANAGER can update courses");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Check if the user is the creator of the course or a manager
        if (course.getCreator().getId() != currentUser.getId() && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("You can only update your own courses");
        }

        // Staff cannot update status
        if (currentUser.getRole() == ERole.ROLE_STAFF && request.getStatus() != null) {
            throw new AccessDeniedException("Staff cannot update course status");
        }

        // Update course fields if provided
        if (request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }

        if (request.getTargetAudience() != null) {
            course.setTargetAudience(request.getTargetAudience());
        }

        if (request.getContent() != null) {
            course.setContent(request.getContent());
        }

        if (request.getDuration() != null) {
            course.setDuration(request.getDuration());
        }

        // Only manager can update status
        if (currentUser.getRole() == ERole.ROLE_MANAGER && request.getStatus() != null) {
            course.setStatus(request.getStatus());
        }

        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new RuntimeException("Topic not found with ID: " + request.getTopicId()));
            course.setTopic(topic);
        }

        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(request.getCoverImage());
            course.setCoverImage(imageUrl);
        }

        Course savedCourse = courseRepository.save(course);
        log.info("Course updated: {}", savedCourse.getTitle());

        // Update or create modules if provided
        List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);

        if (request.getModules() != null && !request.getModules().isEmpty()) {
            // Remove existing modules
            moduleRepository.deleteAll(modules);

            // Create new modules
            List<CourseModule> newModules = new ArrayList<>();
            for (CourseModuleRequest moduleRequest : request.getModules()) {
                CourseModule module = new CourseModule();
                module.setTitle(moduleRequest.getTitle());
                module.setContent(moduleRequest.getContent());
                module.setDuration(moduleRequest.getDuration());
                module.setOrderIndex(moduleRequest.getOrderIndex());
                module.setCourse(savedCourse);

                List<VideoCourse> videos = new ArrayList<>();
                if (moduleRequest.getVideos() != null) {
                    for (String url : moduleRequest.getVideos()) {
                        VideoCourse video = new VideoCourse();
                        video.setVideoUrl(url);
                        video.setCourseModule(module);
                        videos.add(video);
                    }
                }
                module.setVideos(videos);
                newModules.add(module);
            }
            moduleRepository.saveAll(newModules);
            modules = newModules;
        }

        return mapToCourseResponse(savedCourse, modules, false);
    }
    
    private CourseResponse mapToCourseResponse(Course course, List<CourseModule> modules, boolean isEnrolled) {
        List<CourseModuleResponse> moduleResponses = modules.stream()
                .map(this::mapToModuleResponse)
                .collect(Collectors.toList());
                
        long enrollmentCount = enrollmentRepository.countByCourse(course);
                
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .targetAudience(course.getTargetAudience())
                .coverImage(course.getCoverImage())
                .content(course.getContent())
                .duration(course.getDuration())
                .isActive(course.isActive())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .creator(mapToUserDetailResponse(course.getCreator()))
                .modules(moduleResponses)
                .enrollmentCount((int) enrollmentCount)
                .isEnrolled(isEnrolled)
                .build();
    }

    private CourseHomeResponse mapToCourseHomeResponse(Course course, boolean isEnrolled) {
        CourseHomeResponse dto = new CourseHomeResponse();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setSummary(course.getDescription());
        dto.setCoverImage(course.getCoverImage());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setTopicName(course.getTopic() != null ? course.getTopic().getName() : null);
        dto.setEnrolled(isEnrolled);
        return dto;
    }

    private CourseModuleResponse mapToModuleResponse(CourseModule module) {
        List<String> videoUrls = module.getVideos() != null
                ? module.getVideos().stream()
                .map(VideoCourse::getVideoUrl)
                .collect(Collectors.toList())
                : new ArrayList<>();
        return CourseModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .content(module.getContent())
                .videoUrl(videoUrls)
                .duration(module.getDuration())
                .orderIndex(module.getOrderIndex())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }
    
    private UserDetailResponse mapToUserDetailResponse(User user) {
        return UserDetailResponse.builder()
                .email(user.getEmail())
                .firstName(user.getUsername())
                .lastName(user.getFullname())
                .avatar(user.getAddress())
                .role(user.getRole().name())
                .build();
    }
} 