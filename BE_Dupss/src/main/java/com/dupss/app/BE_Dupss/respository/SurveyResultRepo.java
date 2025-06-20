package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.SurveyResult;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SurveyResultRepo extends JpaRepository<SurveyResult, Long> {
    List<SurveyResult> findByUser(User user);
}
