package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyQuestionRepo extends JpaRepository<SurveyQuestion, Long> {
}
