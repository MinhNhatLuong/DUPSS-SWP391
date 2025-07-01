package com.dupss.app.BE_Dupss.dto.request;

import com.dupss.app.BE_Dupss.validation.NotInPast;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDto {
    
    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String phoneNumber;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotNull(message = "Ngày hẹn không được để trống")
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate appointmentDate;
    
    @NotNull(message = "Giờ hẹn không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime appointmentTime;
    
    @NotNull(message = "Chủ đề tư vấn không được để trống")
    private Long topicId;
    
    // Nếu đây là một thành viên đã đăng nhập, userId sẽ được set
    private Long userId;
} 