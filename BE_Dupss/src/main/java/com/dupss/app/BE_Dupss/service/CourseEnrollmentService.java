package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.respository.CertificateRepo;
import com.dupss.app.BE_Dupss.util.SecurityUtils;
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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;


public interface CourseEnrollmentService {

     CourseEnrollmentResponse enrollCourse(Long courseId) throws MessagingException, UnsupportedEncodingException;
    
     List<CourseEnrollmentResponse> getEnrolledCourses();

     CourseEnrollmentResponse updateProgress(Long enrollmentId, Double progress);

     void markVideoAsWatched(Long videoId, boolean watchedStatus) throws MessagingException, UnsupportedEncodingException;

     QuizResultResponse submitCourseQuiz(Long courseId, SurveyResultRequest request) throws MessagingException, UnsupportedEncodingException;

     CertificateResponse getCertificateResponse(Long courseId, Long userId);

} 