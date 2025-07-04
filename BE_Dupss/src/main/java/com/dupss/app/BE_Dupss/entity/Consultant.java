package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String certificates;

    @Column(columnDefinition = "NVARCHAR(5000)")
    private String bio;

    @Enumerated(EnumType.STRING)
    private AcademicTitle academicTitle;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
