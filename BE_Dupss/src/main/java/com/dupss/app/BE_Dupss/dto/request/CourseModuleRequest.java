package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseModuleRequest {
    @NotBlank(message = "Tiêu đề module không được để trống")
    private String title;
    
    private String description;
    
    private String content;

    private List<String> videos;
    
    private Integer duration;
    
    @PositiveOrZero(message = "Thứ tự module không được âm")
    private Integer orderIndex;
} 