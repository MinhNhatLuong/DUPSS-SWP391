package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.CourseCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseModuleRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseUpdateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.CloudinaryService;
import com.dupss.app.BE_Dupss.service.CourseService;
import com.dupss.app.BE_Dupss.service.SurveyService;
import com.dupss.app.BE_Dupss.util.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final WatchedVideoRepo watchedVideoRepo;
    private final UserRepository userRepository;
    private final TopicRepo topicRepository;
    private final CloudinaryService cloudinaryService;
    private final SurveyService surveyService;
    private final SurveyRepo surveyRepository;
    private final ObjectMapper objectMapper;
    private final ActionLogRepo actionLogRepo;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request) throws IOException {
        User currentUser = securityUtils.getCurrentUser();

        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_STAFF && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only STAFF and MANAGER can create courses");
        }

        //check topic
        Topic topic = topicRepository.findByIdAndActive(request.getTopicId(), true);
        if (topic == null) {
            throw new RuntimeException("Topic not found with ID: " + request.getTopicId());
        }
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setTopic(topic);
        course.setDescription(request.getDescription());
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

        if (StringUtils.hasText(request.getModules())) {
            List<CourseModuleRequest> moduleRequests = objectMapper.readValue(
                    request.getModules(), new TypeReference<>() {
                    });

            for (CourseModuleRequest moduleRequest : moduleRequests) {
                CourseModule module = new CourseModule();
                module.setTitle(moduleRequest.getTitle());
                module.setOrderIndex(moduleRequest.getOrderIndex());
                module.setCourse(savedCourse);

                List<VideoCourse> videos = new ArrayList<>();
                if (moduleRequest.getVideos() != null) {
                    for (CourseModuleRequest.VideoCourseRequest url : moduleRequest.getVideos()) {
                        VideoCourse video = new VideoCourse();
                        video.setTitle(url.getTitle());
                        video.setVideoUrl(url.getVideoUrl());
                        video.setCourseModule(module);
                        videos.add(video);
                    }
                }
                module.setVideos(videos);
                modules.add(module);
            }
            moduleRepository.saveAll(modules);
        }

        // Parse quiz
        if (StringUtils.hasText(request.getQuiz())) {
            SurveyCreateRequest quizRequest = objectMapper.readValue(
                    request.getQuiz(), SurveyCreateRequest.class);
            Survey quiz = surveyService.createAndSaveSurveyEntity(quizRequest, null, currentUser);
            quiz.setForCourse(true);
            surveyRepository.save(quiz);
            savedCourse.setSurveyQuiz(quiz);
        }

        return mapToCourseResponse(savedCourse, modules, currentUser);
    }

    @Override
    public List<CourseHomeResponse> getLastestCourses() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User currentUser = userRepository.findByUsername(username).orElse(null);

        List<Course> courses = courseRepository.findTop3ByStatusAndActiveTrueOrderByCreatedAtDesc(ApprovalStatus.APPROVED);


        return courses.stream()
                .map(course -> {
                    boolean isEnrolled = false;
                    if (currentUser != null) {
                        isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
                    }
                    return CourseHomeResponse.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .coverImage(course.getCoverImage())
                            .summary(course.getDescription())
                            .createdAt(course.getCreatedAt())
                            .topicName(course.getTopic() != null ? course.getTopic().getName() : null)
                            .creatorName(course.getCreator().getFullname())
                            .duration(course.getDuration())
                            .isEnrolled(isEnrolled)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseManagerResponse> getAllCourses() {

        User currentUser = securityUtils.getCurrentUser();

        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only MANAGER can view all courses");
        }

        List<Course> courses = courseRepository.findAllByActiveTrue();

        return courses.stream()
                .map(course -> {
                    Optional<ActionLog> optionalLog = actionLogRepo.findFirstByTargetTypeAndTargetIdAndActionType(
                            TargetType.COURSE, course.getId(), ActionType.UPDATE);
                    return CourseManagerResponse.builder()
                            .id(course.getId())
                            .topicName(course.getTopic().getName())
                            .title(course.getTitle())
                            .description(course.getDescription())
                            .coverImage(course.getCoverImage())
                            .createdAt(course.getCreatedAt())
                            .updatedAt(course.getUpdatedAt())
                            .creatorName(course.getCreator().getFullname())
                            .status(course.getStatus())
                            .duration(course.getDuration())
                            .checkedBy(optionalLog.isPresent() ? optionalLog.get().getPerformedBy().getFullname() : "N/A")
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<CourseHomeResponse> searchCoursesSummary(String keyword, Long topicId, Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        Page<Course> courses = courseRepository.searchCourses(keyword, topicId, pageable);
        return courses.map(course -> {
            boolean isEnrolled = false;
            if (currentUser != null) {
                isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
            }
            return mapToCourseHomeResponse(course, isEnrolled);
        });
    }


    @Override
    public CourseResponse getCourseById(Long id) {

        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);


        boolean isEnrolled = enrollmentRepository.existsByUserAndCourse(currentUser, course);
        boolean isOwner = course.getCreator() != null && Objects.equals(course.getCreator().getId(), currentUser.getId());

        if (!isEnrolled && !isOwner) {
            throw new AccessDeniedException("Bạn không có quyền truy cập khóa học này");
        }

        return mapToCourseResponse(course, modules, currentUser);
    }

    @Override
    public CourseResponse getCourseDetail(Long id) {


        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);

        return mapToCourseResponse(course, modules, course.getCreator());
    }

    @Override
    public List<CourseResponse> getCoursePending() {

        User currentUser = securityUtils.getCurrentUser();

        List<Course> courses = courseRepository.findByStatusAndActiveTrue(ApprovalStatus.PENDING);
        List<CourseResponse> response = courses.stream()
                .map(course -> mapToCourseResponse(course, course.getModules(), currentUser))
                .collect(Collectors.toList());
        return response;
    }

    @Override
    public CourseDetailPublicResponse getCoursePublicDetail(Long id) {

        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        Optional<CourseEnrollment> enrollmentOpt =
                enrollmentRepository.findByUserAndCourse(currentUser, course);

        EnrollmentStatus enrollmentStatus = EnrollmentStatus.NOT_ENROLLED;

        if (enrollmentOpt.isPresent()) {
            enrollmentStatus = enrollmentOpt.get().getStatus();
        }

        List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);
        long enrollmentCount = enrollmentRepository.countByCourse(course);

        return CourseDetailPublicResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .topicName(course.getTopic().getName())
                .content(course.getContent())
                .coverImage(course.getCoverImage())
                .duration(course.getDuration())
                .createdBy(course.getCreator() != null ? course.getCreator().getFullname() : "Unknown")
                .videoCount(modules.stream().mapToInt(m -> m.getVideos().size()).sum())
                .totalEnrolled(enrollmentCount)
                .status(enrollmentStatus)
                .modules(modules.stream()
                        .map(m -> CourseDetailPublicResponse.ModuleInfo.builder()
                                .id(m.getId())
                                .title(m.getTitle())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<CourseResponse> getCreatedCourses() {
        User currentUser = securityUtils.getCurrentUser();

        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_STAFF && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only STAFF and MANAGER can view created courses");
        }

        List<Course> courses = courseRepository.findByCreatorAndActiveTrue(currentUser);

        return courses.stream()
                .map(course -> {
                    List<CourseModule> modules = moduleRepository.findByCourseOrderByOrderIndexAsc(course);
                    return mapToCourseResponse(course, modules, currentUser);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseUpdateRequest request) throws IOException {

        User currentUser = securityUtils.getCurrentUser();

        // Check if user has STAFF or MANAGER role
        if (currentUser.getRole() != ERole.ROLE_STAFF && currentUser.getRole() != ERole.ROLE_MANAGER) {
            throw new AccessDeniedException("Only STAFF and MANAGER can update courses");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Check if the user is the creator of the course or a manager
        if (course.getCreator().getId() != currentUser.getId()) {
            throw new AccessDeniedException("You can only update your own courses");
        }


        // Update course fields if provided
        if (request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }

        if (request.getContent() != null) {
            course.setContent(request.getContent());
        }

        if (request.getDuration() != null) {
            course.setDuration(request.getDuration());
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

        // Update modules if provided
        updateModules(savedCourse, request.getModules());

        // Convert quiz from JSON string
        if (StringUtils.hasText(request.getQuiz())) {
            SurveyCreateRequest quizRequest = objectMapper.readValue(
                    request.getQuiz(), SurveyCreateRequest.class);

            Survey quiz = course.getSurveyQuiz();
            if (quiz == null) {
                throw new RuntimeException("Khóa học không có bài quiz để cập nhật");
            }

            surveyService.updateSurvey(quizRequest, quiz.getId(), null);
            quiz.setForCourse(true);
            surveyRepository.save(quiz);
            savedCourse.setSurveyQuiz(quiz);
        }
        course.setStatus(ApprovalStatus.PENDING);

        return mapToCourseResponse(savedCourse, savedCourse.getModules(), currentUser);
    }

    private void updateModules(Course savedCourse, String modulesJson) throws JsonProcessingException {
        if (!StringUtils.hasText(modulesJson)) return;

        List<CourseModuleRequest> moduleRequests = objectMapper.readValue(modulesJson, new TypeReference<>() {
        });
        List<CourseModule> existingModules = moduleRepository.findByCourseOrderByOrderIndexAsc(savedCourse);

        // Tạo Map để truy cập nhanh CourseModule theo ID
        Map<Long, CourseModule> existingModuleMap = existingModules.stream()
                .filter(m -> m.getId() != null)
                .collect(Collectors.toMap(CourseModule::getId, m -> m));

        // Lấy danh sách ID các module từ request
        Set<Long> incomingModuleIds = moduleRequests.stream()
                .map(CourseModuleRequest::getCourseModuleId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Xóa các module không còn trong request bằng removeIf
        existingModules.removeIf(module -> {
            boolean shouldDelete = module.getId() != null && !incomingModuleIds.contains(module.getId());
            if (shouldDelete) {
                // Xóa video đã xem trước
                module.getVideos().forEach(video -> watchedVideoRepo.deleteByVideo(video));
                moduleRepository.delete(module); // Xóa module khỏi DB
            }
            return shouldDelete;
        });

        List<CourseModule> updatedModules = new ArrayList<>();

        for (CourseModuleRequest moduleRequest : moduleRequests) {
            CourseModule module = moduleRequest.getCourseModuleId() != null
                    ? existingModuleMap.getOrDefault(moduleRequest.getCourseModuleId(), new CourseModule())
                    : new CourseModule();

            module.setCourse(savedCourse);
            module.setTitle(moduleRequest.getTitle());
            module.setOrderIndex(moduleRequest.getOrderIndex());

            // Xử lý danh sách video
            List<VideoCourse> currentVideos = module.getVideos();
            if (currentVideos == null) {
                currentVideos = new ArrayList<>();
                module.setVideos(currentVideos);
            }

            Map<Long, VideoCourse> videoMap = currentVideos.stream()
                    .filter(v -> v.getId() != null)
                    .collect(Collectors.toMap(VideoCourse::getId, v -> v));

            List<CourseModuleRequest.VideoCourseRequest> videoRequests = moduleRequest.getVideos() != null
                    ? moduleRequest.getVideos()
                    : new ArrayList<>();

            Set<Long> incomingVideoIds = videoRequests.stream()
                    .map(CourseModuleRequest.VideoCourseRequest::getVideoModuleId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // Xóa video không còn trong request bằng removeIf
            currentVideos.removeIf(video -> {
                boolean shouldDelete = video.getId() != null && !incomingVideoIds.contains(video.getId());
                if (shouldDelete) {
                    watchedVideoRepo.deleteByVideo(video);
                }
                return shouldDelete;
            });

            // Thêm hoặc cập nhật video
            for (CourseModuleRequest.VideoCourseRequest videoRequest : videoRequests) {
                VideoCourse video = videoRequest.getVideoModuleId() != null
                        ? videoMap.getOrDefault(videoRequest.getVideoModuleId(), new VideoCourse())
                        : new VideoCourse();

                video.setTitle(videoRequest.getTitle());
                video.setVideoUrl(videoRequest.getVideoUrl());
                video.setCourseModule(module);

                if (video.getId() == null || !currentVideos.contains(video)) {
                    currentVideos.add(video);
                }
            }

            updatedModules.add(module);
        }

        moduleRepository.saveAll(updatedModules);
    }


    @Override
    public void updateStatus(Long courseId, ApprovalStatus status) {
        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findByIdAndActiveTrue(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));
        if (course.getStatus().equals(ApprovalStatus.PENDING)) {
            course.setStatus(status);
        } else {
            throw new RuntimeException("Blog đã được phê duyệt hoặc từ chối, không thể cập nhật trạng thái");
        }
        courseRepository.save(course);

        ActionLog actionLog = ActionLog.builder()
                .performedBy(currentUser)
                .actionType(ActionType.UPDATE)
                .targetType(TargetType.COURSE)
                .targetId(course.getId())
                .actionTime(course.getUpdatedAt())
                .build();
        actionLogRepo.save(actionLog);
    }

    @Override
    public void deleteCourse(Long courseId) {
        User currentUser = securityUtils.getCurrentUser();

        Course course = courseRepository.findByIdAndActiveTrue(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));


        if (course.getCreator().getId() != currentUser.getId()) {
            throw new AccessDeniedException("Bạn chỉ có thể xóa các khóa học của chính mình");
        }

        // Set course as inactive instead of deleting
        course.setActive(false);
        courseRepository.save(course);

        ActionLog actionLog = ActionLog.builder()
                .performedBy(currentUser)
                .actionType(ActionType.DELETE)
                .targetType(TargetType.COURSE)
                .targetId(course.getId())
                .actionTime(course.getUpdatedAt())
                .build();
        actionLogRepo.save(actionLog);
    }

    private CourseResponse mapToCourseResponse(Course course, List<CourseModule> modules, User currentUser) {
        List<CourseModuleResponse> moduleResponses = modules.stream()
                .map(m -> mapToModuleResponse(m, currentUser))
                .collect(Collectors.toList());

        SurveyResponse quizResponse = null;
        if (course.getSurveyQuiz() != null) {
            quizResponse = SurveyResponse.builder()
                    .id(course.getSurveyQuiz().getId())
                    .title(course.getSurveyQuiz().getTitle())
                    .sections(course.getSurveyQuiz().getSections().stream()
                            .map(SurveyResponse.SurveySectionDTO::fromEntity)
                            .collect(Collectors.toList()))
                    .conditions(course.getSurveyQuiz().getConditions().stream()
                            .map(SurveyResponse.SurveyConditionDTO::fromEntity)
                            .collect(Collectors.toList()))
                    .forCourse(course.getSurveyQuiz().isForCourse())
                    .active(course.getSurveyQuiz().isActive())
                    .build();
        }

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .topicName(course.getTopic() != null ? course.getTopic().getName() : null)
                .description(course.getDescription())
                .content(course.getContent())
                .duration(course.getDuration())
                .coverImage(course.getCoverImage())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .creator(course.getCreator().getFullname())
                .modules(moduleResponses)
                .quiz(quizResponse)
                .status(course.getStatus())
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
        dto.setCreatorName(course.getCreator().getFullname());
        dto.setDuration(course.getDuration());
        dto.setEnrolled(isEnrolled);
        return dto;
    }

    private CourseModuleResponse mapToModuleResponse(CourseModule module, User currentUser) {
        List<VideoCourseResponse> videoDTOs = module.getVideos().stream()
                .map(video -> {
                    return VideoCourseResponse.builder()
                            .id(video.getId())
                            .title(video.getTitle())
                            .videoUrl(video.getVideoUrl())
                            .build();
                })
                .collect(Collectors.toList());
        return CourseModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .videos(videoDTOs)
                .orderIndex(module.getOrderIndex())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }
}
