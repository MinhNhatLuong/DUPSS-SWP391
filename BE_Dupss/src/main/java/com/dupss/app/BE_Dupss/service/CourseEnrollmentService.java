package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.response.CourseEnrollmentResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseModuleResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.CourseEnrollmentRepository;
import com.dupss.app.BE_Dupss.respository.CourseModuleRepository;
import com.dupss.app.BE_Dupss.respository.CourseRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseEnrollmentService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public CourseEnrollmentResponse enrollCourse(Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has MEMBER role
        if (currentUser.getRole() != ERole.ROLE_MEMBER) {
            throw new AccessDeniedException("Only MEMBER can enroll in courses");
        }
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Check if course is active
        if (!course.isActive()) {
            throw new RuntimeException("Cannot enroll in inactive course");
        }
        
        // Check if user is already enrolled
        if (enrollmentRepository.existsByUserAndCourse(currentUser, course)) {
            throw new RuntimeException("User already enrolled in this course");
        }
        
        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setUser(currentUser);
        enrollment.setCourse(course);
        enrollment.setCompleted(false);
        enrollment.setProgress(0.0);
        
        CourseEnrollment savedEnrollment = enrollmentRepository.save(enrollment);
        
        log.info("User {} enrolled in course: {}", currentUser.getUsername(), course.getTitle());
        
        return mapToEnrollmentResponse(savedEnrollment);
    }
    
    public List<CourseEnrollmentResponse> getEnrolledCourses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has MEMBER role
        if (currentUser.getRole() != ERole.ROLE_MEMBER) {
            throw new AccessDeniedException("Only MEMBER can view enrolled courses");
        }
        
        List<CourseEnrollment> enrollments = enrollmentRepository.findByUser(currentUser);
        
        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CourseEnrollmentResponse updateProgress(Long enrollmentId, Double progress) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        // Check if the enrollment belongs to the current user
        if (enrollment.getUser().getId() != currentUser.getId()) {
            throw new AccessDeniedException("You can only update your own enrollment progress");
        }
        
        enrollment.setProgress(progress);
        
        // Mark as completed if progress is 100%
        if (progress >= 100.0) {
            enrollment.setCompleted(true);
            enrollment.setCompletionDate(java.time.LocalDateTime.now());
        }
        
        CourseEnrollment savedEnrollment = enrollmentRepository.save(enrollment);
        
        return mapToEnrollmentResponse(savedEnrollment);
    }
    
    private CourseEnrollmentResponse mapToEnrollmentResponse(CourseEnrollment enrollment) {
        List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(enrollment.getCourse());
        
        return CourseEnrollmentResponse.builder()
                .id(enrollment.getId())
                .course(mapToCourseResponse(enrollment.getCourse(), modules, true))
                .user(mapToUserDetailResponse(enrollment.getUser()))
                .enrollmentDate(enrollment.getEnrollmentDate())
                .completionDate(enrollment.getCompletionDate())
                .completed(enrollment.isCompleted())
                .progress(enrollment.getProgress())
                .build();
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