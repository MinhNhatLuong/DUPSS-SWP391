package com.dupss.app.BE_Dupss.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotRequestDto {
    
    @NotNull(message = "Ngày không được để trống")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private Date date;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @NotNull(message = "ID tư vấn viên không được để trống")
    private Long consultantId;
    
    private boolean isAvailable = true;
} 