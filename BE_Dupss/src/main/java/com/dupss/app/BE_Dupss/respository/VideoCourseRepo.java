package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.VideoCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoCourseRepo extends JpaRepository<VideoCourse, Long> {
    long countByCourseModule_Course(Course course);
}
