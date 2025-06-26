package com.dupss.app.BE_Dupss.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {
    
    private Long id;
    private String customerName;
    private String phoneNumber;
    private String email;
    
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate appointmentDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime appointmentTime;
    
    private String topicName;
    private String consultantName;
    private Long consultantId;
    private boolean isGuest;
    private String status;
    private Long userId;
    
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime checkInTime;
    
    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime checkOutTime;
    
    private String consultantNote;
    private Integer reviewScore;
    private String customerReview;
    private boolean isReview;
    private String linkGoogleMeet;
} 