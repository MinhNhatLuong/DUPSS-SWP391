package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Survey;
import com.dupss.app.BE_Dupss.entity.SurveyResult;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SurveyRepo extends JpaRepository<Survey, Long> {
    List<Survey> findAllByActiveTrueAndForCourseOrderByCreatedAtDesc(boolean forCourse);
    List<Survey> findByStatus(ApprovalStatus status);
    List<Survey> findByCreatedBy(User user);
    List<Survey> findByStatusAndActiveTrueAndForCourseFalse(ApprovalStatus status);
}
