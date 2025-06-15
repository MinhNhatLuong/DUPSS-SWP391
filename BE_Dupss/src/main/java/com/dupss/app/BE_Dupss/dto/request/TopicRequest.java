package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopicRequest {
    @NotBlank(message = "Topic name cannot be blank")
    private String name;
    private String description;
}
