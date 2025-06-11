package com.dupss.app.BE_Dupss.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultantTopicsRequestDto {
    private List<Long> topicIds;
} 