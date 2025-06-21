package com.dupss.app.BE_Dupss.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotResponseDto {
    
    private Long id;
    
    @JsonFormat(pattern = "dd/MM/yyyy")
    private Date date;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    private Long consultantId;
    private String consultantName;
    private boolean isAvailable;
} 