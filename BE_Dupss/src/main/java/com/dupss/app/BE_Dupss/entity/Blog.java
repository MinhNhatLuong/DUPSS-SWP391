package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(length = 5000)
    private String description;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;


    private String coverImage;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean active;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
