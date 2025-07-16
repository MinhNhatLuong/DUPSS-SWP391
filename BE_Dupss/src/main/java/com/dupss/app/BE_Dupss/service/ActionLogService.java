package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.response.ActionLogResponse;
import com.dupss.app.BE_Dupss.entity.ActionLog;

import java.util.List;

public interface ActionLogService {

    List<ActionLogResponse> getAllActionLog();

}
