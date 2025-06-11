package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Topic name cannot be blank")
    private String name;
    private String description;
    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    private List<Blog> blogs = new ArrayList<>();

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    private List<Course> courses = new ArrayList<>();

    public Topic(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
