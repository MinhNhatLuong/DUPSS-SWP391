package com.dupss.app.BE_Dupss.dto.request;

import com.dupss.app.BE_Dupss.entity.VideoCourse;
import jakarta.validation.Valid;
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

    @Valid
    private List<VideoCourseRequest> videos;

    @PositiveOrZero(message = "Thứ tự module không được âm")
    private Integer orderIndex;

    @Data
    public static class VideoCourseRequest {
        @NotBlank(message = "Tiêu đề video không được để trống")
        private String title;

        @NotBlank(message = "Đường dẫn video không được để trống")
        private String videoUrl;
    }

} 