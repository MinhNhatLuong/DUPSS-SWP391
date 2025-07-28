package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.SurveyOption;
import com.dupss.app.BE_Dupss.entity.SurveyResultOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SurveyResultOptionRepo extends JpaRepository<SurveyResultOption, Long> {
    @Modifying
    @Query("DELETE FROM SurveyResultOption sro WHERE sro.surveyOption = :option")
    void deleteBySurveyOption(@Param("option") SurveyOption option);
}
