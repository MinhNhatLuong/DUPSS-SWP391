package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.ActionLog;
import com.dupss.app.BE_Dupss.entity.ActionType;
import com.dupss.app.BE_Dupss.entity.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActionLogRepo extends JpaRepository<ActionLog, Long> {
    List<ActionLog> findByTargetTypeAndTargetIdOrderByActionTimeDesc(TargetType type, Long targetId);

    Optional<ActionLog> findFirstByTargetTypeAndTargetIdAndActionType(TargetType targetType, Long targetId, ActionType actionType);

    List<ActionLog> findAllByTargetTypeOrderByActionTimeDesc(TargetType targetType);
}
