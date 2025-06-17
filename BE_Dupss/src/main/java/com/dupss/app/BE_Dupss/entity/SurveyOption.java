package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class SurveyOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String optionText;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private Integer orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SurveyQuestion question;

    @ManyToMany(mappedBy = "selectedOptions")
    private Set<SurveyResult> selectedBy = new HashSet<>();
}
