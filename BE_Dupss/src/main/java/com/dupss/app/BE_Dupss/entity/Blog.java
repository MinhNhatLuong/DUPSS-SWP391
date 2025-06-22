package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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
    @Column(columnDefinition = "TEXT")
    private String content;
    @OneToMany(mappedBy = "blogPost", cascade = CascadeType.ALL)
    private List<BlogImage> images = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status;
    private String tags;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDate.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDate.now();
    }
}
