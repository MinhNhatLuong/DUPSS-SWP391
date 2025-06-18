package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.AppointmentRequestDto;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * API tạo cuộc hẹn mới
     * Có thể được sử dụng bởi cả khách (guest) và thành viên (member)
     * Đối với guest, userId sẽ là null
     * Đối với member, userId sẽ được thiết lập
     */
    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(@Valid @RequestBody AppointmentRequestDto requestDto) {
        AppointmentResponseDto responseDto = appointmentService.createAppointment(requestDto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    /**
     * API lấy tất cả cuộc hẹn
     * Chỉ dành cho admin
     */
    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    /**
     * API lấy cuộc hẹn theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Long id) {
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * API lấy cuộc hẹn của khách (guest) theo email
     * Dùng cho khách chưa đăng nhập muốn xem lịch sử đặt lịch của họ
     */
    @GetMapping("/guest")
    public ResponseEntity<List<AppointmentResponseDto>> getGuestAppointments(@RequestParam String email) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByGuestEmail(email);
        return ResponseEntity.ok(appointments);
    }

    /**
     * API lấy cuộc hẹn của thành viên (member) theo userId
     * Dùng cho thành viên đã đăng nhập xem lịch sử đặt lịch của họ
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentResponseDto>> getUserAppointments(@PathVariable Long userId) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByUserId(userId);
        return ResponseEntity.ok(appointments);
    }
    
    /**
     * API lấy cuộc hẹn của tư vấn viên theo consultantId
     * Chỉ dành cho tư vấn viên
     */
    @GetMapping("/consultant/{consultantId}")
    public ResponseEntity<List<AppointmentResponseDto>> getConsultantAppointments(@PathVariable Long consultantId) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByConsultantId(consultantId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * API lấy cuộc hẹn của tư vấn viên đã được tư vấn thành công hoặc đã hủy
     * Chỉ dành cho tư vấn viên
     */
    @GetMapping("/consultant/{consultantId}/history")
    public ResponseEntity<List<AppointmentResponseDto>> getConsultantAppointmentHistory(@PathVariable Long consultantId) {
        List<AppointmentResponseDto> appointments = appointmentService.getCompletedOrCanceledAppointmentsByConsultantId(consultantId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * API cập nhật trạng thái cuộc hẹn
     * Chỉ dành cho tư vấn viên, và tư vấn viên chỉ được cập nhật cuộc hẹn của chính họ
     * Có thể sử dụng với JWT token hoặc cung cấp consultantId trực tiếp
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) Long consultantId) {
        
        AppointmentResponseDto updatedAppointment;
        
        if (consultantId != null) {
            // Sử dụng phương thức với consultantId được cung cấp
            updatedAppointment = appointmentService.updateAppointmentStatus(id, status, consultantId);
        } else {
            // Sử dụng phương thức lấy consultantId từ JWT token
            updatedAppointment = appointmentService.updateAppointmentStatus(id, status);
        }
        
        return ResponseEntity.ok(updatedAppointment);
    }
    
    /**
     * API hủy cuộc hẹn của thành viên đã đăng nhập
     * Dùng cho thành viên đã đăng nhập muốn hủy cuộc hẹn của họ
     */
    @PostMapping("/{id}/cancel/user/{userId}")
    public ResponseEntity<AppointmentResponseDto> cancelUserAppointment(
            @PathVariable Long id,
            @PathVariable Long userId) {
        AppointmentResponseDto canceledAppointment = appointmentService.cancelAppointmentByUser(id, userId);
        return ResponseEntity.ok(canceledAppointment);
    }
    
    /**
     * API hủy cuộc hẹn của khách (guest)
     * Dùng cho khách chưa đăng nhập muốn hủy cuộc hẹn của họ
     */
    @PostMapping("/{id}/cancel/guest")
    public ResponseEntity<AppointmentResponseDto> cancelGuestAppointment(
            @PathVariable Long id,
            @RequestParam String email) {
        AppointmentResponseDto canceledAppointment = appointmentService.cancelAppointmentByGuest(id, email);
        return ResponseEntity.ok(canceledAppointment);
    }
} 