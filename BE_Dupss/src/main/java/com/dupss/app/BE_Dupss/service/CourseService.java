package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.CourseCreateRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseModuleRequest;
import com.dupss.app.BE_Dupss.dto.request.CourseUpdateRequest;
import com.dupss.app.BE_Dupss.dto.request.SurveyCreateRequest;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.*;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public interface CourseService {

    CourseResponse createCourse(CourseCreateRequest request) throws IOException;

    List<CourseHomeResponse> getLastestCourses();

    List<CourseManagerResponse> getAllCourses();

    Page<CourseHomeResponse> searchCoursesSummary(String keyword, Long topicId, Pageable pageable);

    CourseResponse getCourseById(Long id);

    CourseResponse getCourseDetail(Long id);

    List<CourseResponse> getCoursePending();

    CourseDetailPublicResponse getCoursePublicDetail(Long id);

    List<CourseResponse> getCreatedCourses();

    CourseResponse updateCourse(Long courseId, CourseUpdateRequest request) throws IOException;

    void updateStatus(Long courseId, ApprovalStatus status);

    void deleteCourse(Long courseId);

} 