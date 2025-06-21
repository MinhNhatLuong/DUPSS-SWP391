package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Certificate;
import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CertificateRepo extends JpaRepository<Certificate, Long> {
    boolean existsByUserAndCourse(User user, Course course);
    Optional<Certificate> findByUserIdAndCourseId(Long userId, Long courseId);
}
