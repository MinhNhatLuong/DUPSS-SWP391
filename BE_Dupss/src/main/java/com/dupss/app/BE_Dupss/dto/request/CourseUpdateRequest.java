package com.dupss.app.BE_Dupss.dto.request;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
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
    private String targetAudience;
    private MultipartFile coverImage;
    private String content;
    private Integer duration;
    private ApprovalStatus status;
    private List<CourseModuleRequest> modules;
}
