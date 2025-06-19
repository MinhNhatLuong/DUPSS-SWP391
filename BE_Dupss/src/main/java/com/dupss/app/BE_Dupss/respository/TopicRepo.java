package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepo extends JpaRepository<Topic, Long> {
    boolean existsByNameIgnoreCase(String name);
    List<Topic> findByCreator_UsernameAndActive(String creatorUsername, boolean active);
    @Query("SELECT t FROM Topic t WHERE t.active = true")
    List<Topic> findAllActive();
    Topic findByIdAndActive(Long id, Boolean active);
}
