package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Survey;
import com.dupss.app.BE_Dupss.entity.SurveyResult;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SurveyRepo extends JpaRepository<Survey, Long> {
    List<Survey> findAllByActiveTrueAndForCourseAndStatusOrderByCreatedAtDesc(boolean forCourse, ApprovalStatus status);
    List<Survey> findAllByActiveTrueAndForCourseOrderByCreatedAtDesc(boolean forCourse);
    List<Survey> findByStatus(ApprovalStatus status);
    List<Survey> findByCreatedByAndForCourse(User user, boolean forCourse);
    List<Survey> findByStatusAndActiveTrueAndForCourseFalse(ApprovalStatus status);
    Optional<Survey> findByIdAndActiveTrue(Long id);
}
