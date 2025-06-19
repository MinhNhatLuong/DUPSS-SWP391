package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.entity.VideoCourse;
import com.dupss.app.BE_Dupss.entity.WatchedVideo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchedVideoRepo extends JpaRepository<WatchedVideo, Long> {
    boolean existsByUserAndVideo(User user, VideoCourse video);
    long countByUserAndVideo_CourseModule_Course(User user, Course course);
}
