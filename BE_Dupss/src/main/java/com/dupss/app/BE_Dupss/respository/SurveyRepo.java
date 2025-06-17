package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SurveyRepo extends JpaRepository<Survey, Long> {
    List<Survey> findTop2ByActiveTrueOrderByCreatedAtDesc();
}
