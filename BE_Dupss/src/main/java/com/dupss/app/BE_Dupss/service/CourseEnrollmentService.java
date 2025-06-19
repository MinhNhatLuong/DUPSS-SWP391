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
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final EmailService emailService;

    @Transactional
    public CourseEnrollmentResponse enrollCourse(Long courseId) throws MessagingException, UnsupportedEncodingException {
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

        
        // Check if user is already enrolled
        if (enrollmentRepository.existsByUserAndCourse(currentUser, course)) {
            throw new RuntimeException("User already enrolled in this course");
        }
        
        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setUser(currentUser);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setProgress(0.0);
        
        CourseEnrollment savedEnrollment = enrollmentRepository.save(enrollment);

        emailService.sendEnrollmentSuccessEmail(
                currentUser.getEmail(),
                currentUser.getFullname(),
                course.getTitle(),
                course.getDuration(),
                course.getCreator().getFullname(),
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );
        
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
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
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
                .status(enrollment.getStatus())
                .progress(enrollment.getProgress())
                .build();
    }
    
    private CourseResponse mapToCourseResponse(Course course, List<CourseModule> modules, boolean isEnrolled) {
        List<CourseModuleResponse> moduleResponses = modules.stream()
                .map(this::mapToModuleResponse)
                .collect(Collectors.toList());
                
        long enrollmentCount = enrollmentRepository.countByCourse(course);
        EnrollmentStatus enrollmentStatus = EnrollmentStatus.NOT_ENROLLED;
        if( isEnrolled) {
            enrollmentStatus = EnrollmentStatus.IN_PROGRESS;
        }
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .creator(course.getCreator().getFullname())
                .modules(moduleResponses)
                .enrollmentCount((int) enrollmentCount)
                .enrollmentStatus(enrollmentStatus)
                .build();
    }
    
    private CourseModuleResponse mapToModuleResponse(CourseModule module) {
        return CourseModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .videos(module.getVideos())
                .orderIndex(module.getOrderIndex())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }
    
    private UserDetailResponse mapToUserDetailResponse(User user) {
        return UserDetailResponse.builder()
                .email(user.getEmail())
                .fullName(user.getUsername())
                .avatar(user.getAddress())
                .role(user.getRole().name())
                .build();
    }
} 