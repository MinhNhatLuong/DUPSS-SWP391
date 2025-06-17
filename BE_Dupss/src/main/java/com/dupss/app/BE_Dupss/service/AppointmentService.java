package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.AppointmentRequestDto;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;

import java.util.List;

public interface AppointmentService {
    
    /**
     * Tạo cuộc hẹn mới cho khách (guest) hoặc thành viên (member)
     */
    AppointmentResponseDto createAppointment(AppointmentRequestDto requestDto);
    
    /**
     * Lấy tất cả cuộc hẹn
     */
    List<AppointmentResponseDto> getAllAppointments();
    
    /**
     * Lấy cuộc hẹn theo ID
     */
    AppointmentResponseDto getAppointmentById(Long id);
    
    /**
     * Lấy cuộc hẹn theo email của khách (guest)
     */
    List<AppointmentResponseDto> getAppointmentsByGuestEmail(String email);
    
    /**
     * Lấy cuộc hẹn theo ID của thành viên
     */
    List<AppointmentResponseDto> getAppointmentsByUserId(Long userId);
    
    /**
     * Lấy cuộc hẹn theo ID của tư vấn viên
     */
    List<AppointmentResponseDto> getAppointmentsByConsultantId(Long consultantId);
    
    /**
     * Cập nhật trạng thái cuộc hẹn (cần cung cấp consultantId)
     */
    AppointmentResponseDto updateAppointmentStatus(Long id, String status, Long consultantId);
    
    /**
     * Cập nhật trạng thái cuộc hẹn (lấy consultantId từ người dùng đăng nhập)
     */
    AppointmentResponseDto updateAppointmentStatus(Long id, String status);
    
    /**
     * User hủy cuộc hẹn
     */
    AppointmentResponseDto cancelAppointmentByUser(Long id, Long userId);
    
    /**
     * Guest hủy cuộc hẹn
     */
    AppointmentResponseDto cancelAppointmentByGuest(Long id, String email);
    
    /**
     * Lấy danh sách cuộc hẹn của một tư vấn viên đã được tư vấn thành công hoặc đã hủy
     */
    List<AppointmentResponseDto> getCompletedOrCanceledAppointmentsByConsultantId(Long consultantId);
} 