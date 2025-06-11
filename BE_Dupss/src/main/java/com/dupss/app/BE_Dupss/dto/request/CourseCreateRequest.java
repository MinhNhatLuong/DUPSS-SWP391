package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreateRequest {
    @NotBlank(message = "Tiêu đề khóa học không được để trống")
    private String title;

    private Long topicId;

    private String description;
    
    @NotBlank(message = "Đối tượng học viên không được để trống")
    private String targetAudience;
    
    private MultipartFile coverImage;
    
    private String content;
    
    @Positive(message = "Thời lượng khóa học phải lớn hơn 0")
    private Integer duration;
    
    private List<CourseModuleRequest> modules;
} 