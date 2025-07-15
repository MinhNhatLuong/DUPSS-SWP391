package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người thực hiện hành động
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    // Loại hành động: CREATE/UPDATE/DELETE/APPROVE/REJECT
    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    // Mục tiêu của hành động: USER/BLOG/COURSE/SURVEY
    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    private Long targetId;

    private LocalDateTime actionTime;

}
