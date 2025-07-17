package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.response.ActionLogResponse;
import com.dupss.app.BE_Dupss.entity.ActionLog;
import com.dupss.app.BE_Dupss.entity.TargetType;
import com.dupss.app.BE_Dupss.respository.ActionLogRepo;
import com.dupss.app.BE_Dupss.service.ActionLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActionLogServiceImpl implements ActionLogService {

    private final ActionLogRepo actionLogRepo;

    @Override
    public List<ActionLogResponse> getAllActionLog() {
        List<ActionLog> actionLogs = actionLogRepo.findAllByTargetTypeOrderByActionTimeDesc(TargetType.USER);
        return actionLogs.stream()
                .map(actionLog -> ActionLogResponse.builder()
                        .performedBy(actionLog.getPerformedBy().getFullname() + " (" + actionLog.getPerformedBy().getUsername() + ")")
                        .actionType(actionLog.getActionType())
                        .targetType(actionLog.getTargetType())
                        .targetId(actionLog.getTargetId())
                        .actionTime(actionLog.getActionTime())
                        .build())
                .toList();
    }
}
