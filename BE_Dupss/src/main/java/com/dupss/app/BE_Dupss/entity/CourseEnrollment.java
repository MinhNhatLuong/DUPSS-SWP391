package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CourseEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
    
    private boolean completed;
    private Double progress; // Percentage of completion
    private LocalDateTime completionDate;
    private LocalDateTime enrollmentDate;
    
    @PrePersist
    protected void onCreate() {
        this.enrollmentDate = LocalDateTime.now();
        this.completed = false;
        this.progress = 0.0;
    }
} 