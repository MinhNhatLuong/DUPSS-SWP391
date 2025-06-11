package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    Optional<Consultant> findByEmail(String email);
    List<Consultant> findByStatus(String status);
    
    // Tìm consultant theo topic và status active
    @Query("SELECT c FROM Consultant c JOIN c.topics t WHERE t.id = :topicId AND c.status = 'ACTIVE'")
    List<Consultant> findByTopicIdAndStatusActive(@Param("topicId") Long topicId);
} 