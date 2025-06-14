package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicRepo extends JpaRepository<Topic, Long> {
    boolean existsByNameIgnoreCase(String name);
}
