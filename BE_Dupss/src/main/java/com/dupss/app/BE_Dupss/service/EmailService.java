package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.entity.Appointment;

public interface EmailService {
    
    /**
     * Gửi email thông báo đặt lịch thành công cho khách hàng
     */
    void sendAppointmentConfirmation(Appointment appointment);
    
    /**
     * Gửi email thông báo cập nhật trạng thái cuộc hẹn cho khách hàng
     */
    void sendAppointmentStatusUpdate(Appointment appointment, String previousStatus);
} 