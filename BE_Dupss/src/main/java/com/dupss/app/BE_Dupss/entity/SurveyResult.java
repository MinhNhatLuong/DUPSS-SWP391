package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class SurveyResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    private Integer totalScore;


    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @ManyToMany
    @JoinTable(
            name = "survey_result_options",
            joinColumns = @JoinColumn(name = "survey_result_id"),
            inverseJoinColumns = @JoinColumn(name = "option_id")
    )
    private Set<SurveyOption> selectedOptions = new HashSet<>();

}
