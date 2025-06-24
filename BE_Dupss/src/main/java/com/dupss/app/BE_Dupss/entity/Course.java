package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(length = 1000)
    private String description;

    private String coverImage;
    @Column(length = 10000)
    private String content;
    private Integer duration; // Duration in minutes
    private Double progress;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status;

    @OneToOne
    @JoinColumn(name = "quiz_id")
    private Survey surveyQuiz;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<CourseModule> modules = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;
    
//    @ManyToOne
//    @JoinColumn(name = "checked_by_id")
//    private User checkedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

