package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseDetailPublicResponse {
    private Long id;
    private String title;
    private String topicName;
    private String content;
    private String coverImage;
    private int videoCount; // số lượng video
    private int duration;
    private String createdBy;
    private long totalEnrolled;
    private EnrollmentStatus status;
    private List<ModuleInfo> modules; // Không chứa video

    @Data
    @Builder
    public static class ModuleInfo {
        private Long id;
        private String title;
        private String summary;
    }
}
