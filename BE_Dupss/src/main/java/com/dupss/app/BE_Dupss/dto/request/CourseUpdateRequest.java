package com.dupss.app.BE_Dupss.dto.request;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseUpdateRequest {
    private String title;
    private String description;
    private Long topicId;
    private MultipartFile coverImage;
    private String content;
    private Integer duration;
    private String modules;
    private String quiz;
}
