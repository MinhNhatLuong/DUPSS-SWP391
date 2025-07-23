package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.Survey;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCreatorAndActiveTrue(User creator);
    List<Course> findTop3ByStatusAndActiveTrueOrderByCreatedAtDesc(ApprovalStatus status);
    List<Course> findByStatusAndActiveTrue(ApprovalStatus status);
    List<Course> findAllByActiveTrue();
    Optional<Course> findByIdAndActiveTrue(Long id);
    Optional<Survey> findSurveyQuizById(Long id);
    

@Query("SELECT c FROM Course c " +
        "WHERE c.status = com.dupss.app.BE_Dupss.entity.ApprovalStatus.APPROVED AND " +
        "c.active = true AND (" +
        "(:topic IS NULL OR c.topic.id = :topic) AND (" +
        "LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(c.topic.name) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
        "))")
    Page<Course> searchCourses(@Param("keyword") String keyword,@Param("topic") Long topic, Pageable pageable);

} 