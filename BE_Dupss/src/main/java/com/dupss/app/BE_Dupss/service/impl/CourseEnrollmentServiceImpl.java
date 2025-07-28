package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.SurveyResultRequest;
import com.dupss.app.BE_Dupss.dto.response.CertificateResponse;
import com.dupss.app.BE_Dupss.dto.response.CourseEnrollmentResponse;
import com.dupss.app.BE_Dupss.dto.response.QuizResultResponse;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.CourseEnrollmentService;
import com.dupss.app.BE_Dupss.service.EmailService;
import com.dupss.app.BE_Dupss.service.SurveyService;
import com.dupss.app.BE_Dupss.util.SecurityUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseEnrollmentServiceImpl implements CourseEnrollmentService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final EmailService emailService;
    private final WatchedVideoRepo watchedVideoRepository;
    private final VideoCourseRepo videoCourseRepository;
    private final CertificateRepo certificateRepository;
    private final SurveyOptionRepo surveyOptionRepository;
    private final SurveyResultRepo surveyResultRepository;
    private final SurveyService surveyService;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public CourseEnrollmentResponse enrollCourse(Long courseId) throws MessagingException, UnsupportedEncodingException {

        User currentUser = securityUtils.getCurrentUser();

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

    @Override
    public List<CourseEnrollmentResponse> getEnrolledCourses() {

        User currentUser = securityUtils.getCurrentUser();


        List<CourseEnrollment> enrollments = enrollmentRepository.findByUser(currentUser);

        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseEnrollmentResponse updateProgress(Long enrollmentId, Double progress) {

        User currentUser = securityUtils.getCurrentUser();

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

    //check watched videos
    @Override
    public void markVideoAsWatched(Long videoId, boolean watchedStatus) throws MessagingException, UnsupportedEncodingException {
        User user = securityUtils.getCurrentUser();

        VideoCourse video = videoCourseRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        Optional<WatchedVideo> optionalWatched = watchedVideoRepository.findByUserAndVideo(user, video);

        if (watchedStatus) {
            // Nếu chưa có thì tạo mới
            WatchedVideo watchedVideo = optionalWatched.orElseGet(() -> {
                WatchedVideo w = new WatchedVideo();
                w.setUser(user);
                w.setVideo(video);
                return w;
            });
            watchedVideo.setWatched(true);
            watchedVideoRepository.save(watchedVideo);
        } else {
            optionalWatched.ifPresent(w -> {
                w.setWatched(false);
                watchedVideoRepository.save(w);
            });
        }

        // Tính progress
        Course course = video.getCourseModule().getCourse();
        CourseEnrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("You are not enrolled in this course"));

        long totalVideos = videoCourseRepository.countByCourseModule_Course(course);
        long watchedVideos = watchedVideoRepository.countByUserAndVideo_CourseModule_Course_AndWatchedTrue(user, course);

        if (totalVideos == 0) throw new RuntimeException("Khóa học này không có video nào");

        double progress = (watchedVideos * 100.0) / totalVideos;

        enrollment.setProgress(progress);

        enrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional
    public QuizResultResponse submitCourseQuiz(Long courseId, SurveyResultRequest request) throws MessagingException, UnsupportedEncodingException {
        User user = securityUtils.getCurrentUser();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Survey quiz = course.getSurveyQuiz();
        if (quiz == null) {
            throw new RuntimeException("Khóa học này không có bài kiểm tra nào.");
        }

        // Check đã enroll chưa
        CourseEnrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này."));

        // Check đã xem hết video chưa
        long totalVideos = videoCourseRepository.countByCourseModule_Course(course);
        long watchedVideos = watchedVideoRepository.countByUserAndVideo_CourseModule_Course_AndWatchedTrue(user, course);
        if (watchedVideos < totalVideos) {
            throw new RuntimeException("Bạn cần xem hết tất cả video trước khi làm bài kiểm tra.");
        }

        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new RuntimeException("Bạn đã hoàn thành khóa học này. Không thể nộp lại bài kiểm tra.");
        }

        // Chấm điểm quiz
        List<Long> selectedOptionIds = request.getSelectedOptionIds();
        List<SurveyOption> selectedOptions = surveyOptionRepository.findAllById(selectedOptionIds);

        int userScore = selectedOptions.stream().mapToInt(SurveyOption::getScore).sum();
        int totalScore = quiz.getSections().stream()
                .flatMap(section -> section.getQuestions().stream())
                .mapToInt(question ->
                        question.getOptions().stream()
                                .mapToInt(SurveyOption::getScore)
                                .max()
                                .orElse(0) // Nếu không có option nào, coi điểm là 0
                )
                .sum();

        // Save kết quả
        SurveyResult result = new SurveyResult();
        result.setUser(user);
        result.setSurvey(quiz);

        List<SurveyResultOption> resultOptions = selectedOptions.stream().map(option -> {
            SurveyResultOption sro = new SurveyResultOption();
            sro.setSurveyOption(option);
            sro.setSurveyResult(result);
            return sro;
        }).collect(Collectors.toList());

        result.setSelectedOptions(resultOptions);
        result.setSubmittedAt(LocalDateTime.now());
        result.setTotalScore(totalScore);
        result.setScore(userScore);
        surveyResultRepository.save(result);

        List<SurveyCondition> conditions = result.getSurvey().getConditions();
        boolean passed = conditions.stream()
                .allMatch(condition -> surveyService.evaluate(userScore, condition));
        result.setAdvice("Rất tiếc, bạn đã không vượt qua bài kiểm tra.");

        if (passed && enrollment.getProgress() == 100.0) {
            result.setAdvice("Chúc mừng! Bạn đã vượt qua bài kiểm tra.");
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletionDate(LocalDateTime.now());

            boolean certificateExists = certificateRepository.existsByUserAndCourse(user, course);

            if (!certificateExists) {
                Certificate certificate = new Certificate();
                certificate.setUser(user);
                certificate.setCourse(course);
                certificate.setIssuedDate(LocalDateTime.now());
                certificateRepository.save(certificate);
            }
            if(enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
                emailService.sendCourseCompletionEmail(
                        user.getEmail(),
                        user.getFullname(),
                        course.getTitle(),
                        course.getDuration(),
                        course.getCreator().getFullname(),
                        LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                );
            }

            enrollmentRepository.save(enrollment);
        }

        // Trả kết quả
        return QuizResultResponse.builder()
                .totalScore(totalScore)
                .score(userScore)
                .message(result.getAdvice())
                .submittedAt(result.getSubmittedAt())
                .build();
    }

    @Override
    public CertificateResponse getCertificateResponse(Long courseId, Long userId) {
        Certificate cert = certificateRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        return CertificateResponse.builder()
                .courseTitle(cert.getCourse().getTitle())
                .username(cert.getUser().getFullname())
                .build();
    }

    private CourseEnrollmentResponse mapToEnrollmentResponse(CourseEnrollment enrollment) {
        return CourseEnrollmentResponse.builder()
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .username(enrollment.getUser().getUsername())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .completionDate(enrollment.getCompletionDate())
                .status(enrollment.getStatus())
                .progress(enrollment.getProgress())
                .build();
    }

}
