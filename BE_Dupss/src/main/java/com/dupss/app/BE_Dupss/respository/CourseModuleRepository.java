package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseOrderByOrderIndexAsc(Course course);
} 