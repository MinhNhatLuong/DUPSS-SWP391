package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.CourseEnrollment;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByUser(User user);
    List<CourseEnrollment> findByCourse(Course course);
    Optional<CourseEnrollment> findByUserAndCourse(User user, Course course);
    boolean existsByUserAndCourse(User user, Course course);
    long countByCourse(Course course);
} 