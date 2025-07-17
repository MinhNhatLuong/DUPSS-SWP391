package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.ActionType;
import com.dupss.app.BE_Dupss.entity.TargetType;
import com.dupss.app.BE_Dupss.entity.User;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActionLogResponse {
    private String performedBy;

    private ActionType actionType;

    private TargetType targetType;

    private Long targetId;

    private LocalDateTime actionTime;
}
