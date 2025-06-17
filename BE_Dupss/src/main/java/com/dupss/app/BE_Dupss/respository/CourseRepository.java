package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCreator(User creator);
    List<Course> findTop3ByStatusOrderByCreatedAtDesc(ApprovalStatus status);
    
//    @Query("SELECT c FROM Course c JOIN Topic t on c.topic.id = t.id WHERE c.status = com.dupss.app.BE_Dupss.entity.ApprovalStatus.APPROVED AND " +
//            "(:topic IS NULL OR c.topic.id = :topic) OR " +
//           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
//           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
@Query("SELECT c FROM Course c " +
        "WHERE c.status = com.dupss.app.BE_Dupss.entity.ApprovalStatus.APPROVED AND (" +
        "(:topic IS NULL OR c.topic.id = :topic) AND (" +
        "LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(c.topic.name) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
        "))")
    Page<Course> searchCourses(@Param("keyword") String keyword,@Param("topic") Long topic, Pageable pageable);

} 