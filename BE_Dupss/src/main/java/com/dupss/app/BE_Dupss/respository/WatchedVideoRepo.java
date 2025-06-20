package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.entity.VideoCourse;
import com.dupss.app.BE_Dupss.entity.WatchedVideo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchedVideoRepo extends JpaRepository<WatchedVideo, Long> {
    boolean existsByUserAndVideoAndWatchedTrue(User user, VideoCourse video);
    Optional<WatchedVideo> findByUserAndVideo(User user, VideoCourse video);
    long countByUserAndVideo_CourseModule_Course_AndWatchedTrue(User user, Course course);
}
