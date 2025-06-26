package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.AppointmentRequestDto;
import com.dupss.app.BE_Dupss.dto.request.AppointmentStatusUpdateRequest;
import com.dupss.app.BE_Dupss.dto.request.ConsultantNoteRequest;
import com.dupss.app.BE_Dupss.dto.request.AppointmentStatusRequest;
import com.dupss.app.BE_Dupss.dto.request.AppointmentReviewRequest;
import com.dupss.app.BE_Dupss.dto.request.AppointmentEndRequest;
import com.dupss.app.BE_Dupss.dto.request.AppointmentCancelConsultantRequest;
import com.dupss.app.BE_Dupss.dto.request.AppointmentApproveRequest;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createAppointment(requestDto));
    }

    /**
     * API lấy tất cả cuộc hẹn
     * Chỉ dành cho admin
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT')")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    /**
     * API lấy cuộc hẹn theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    /**
     * API lấy cuộc hẹn của khách (guest) theo email
     * Dùng cho khách chưa đăng nhập muốn xem lịch sử đặt lịch của họ
     */
    @GetMapping("/guest")
    public ResponseEntity<List<AppointmentResponseDto>> getAppointmentsByGuestEmail(
            @RequestParam String email) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByGuestEmail(email));
    }

    /**
     * API lấy cuộc hẹn của thành viên (member) theo userId
     * Dùng cho thành viên đã đăng nhập xem lịch sử đặt lịch của họ
     */

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointmentsByUserId(
            @PathVariable Long userId) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByUserId(userId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * API lấy cuộc hẹn của tư vấn viên theo consultantId
     * Chỉ dành cho tư vấn viên
     */
    @GetMapping("/consultant/{consultantId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT')")
    public ResponseEntity<List<AppointmentResponseDto>> getAppointmentsByConsultantId(
            @PathVariable Long consultantId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByConsultantId(consultantId));
    }

    /**
     * API lấy cuộc hẹn của tư vấn viên đã được tư vấn thành công hoặc đã hủy
     * Chỉ dành cho tư vấn viên
     */
    @GetMapping("/consultant/{consultantId}/history")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT')")
    public ResponseEntity<List<AppointmentResponseDto>> getCompletedOrCanceledAppointmentsByConsultantId(
            @PathVariable Long consultantId) {
        return ResponseEntity.ok(appointmentService.getCompletedOrCanceledAppointmentsByConsultantId(consultantId));
    }

    /**
     * API cập nhật trạng thái cuộc hẹn
     * Chỉ dành cho tư vấn viên, và tư vấn viên chỉ được cập nhật cuộc hẹn của chính họ
     * Có thể sử dụng với JWT token hoặc cung cấp consultantId trực tiếp
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT')")
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable Long id, 
            @RequestBody AppointmentStatusRequest request,
            @RequestParam Long consultantId) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, request.getStatus(), consultantId));
    }
    
    /**
     * API hủy cuộc hẹn của thành viên đã đăng nhập
     * Dùng cho thành viên đã đăng nhập muốn hủy cuộc hẹn của họ
     */
    @PutMapping("/{appointmentId}/cancel/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MEMBER') ")
    public ResponseEntity<AppointmentResponseDto> cancelAppointmentByUser(
            @PathVariable("appointmentId") Long appointmentId,
            @PathVariable("userId") Long userId) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByUser(appointmentId, userId));
    }
    
    /**
     * API hủy cuộc hẹn của khách (guest)
     * Dùng cho khách chưa đăng nhập muốn hủy cuộc hẹn của họ
     */
    @PutMapping("/{id}/cancel/guest")
    public ResponseEntity<AppointmentResponseDto> cancelAppointmentByGuest(
            @PathVariable Long id,
            @RequestParam String email) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByGuest(id, email));
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT')")
    public ResponseEntity<List<AppointmentResponseDto>> getUnassignedAppointments() {
        return ResponseEntity.ok(appointmentService.getUnassignedAppointments());
    }

    @PutMapping("/{id}/claim")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT') ")
    public ResponseEntity<AppointmentResponseDto> claimAppointment(
            @PathVariable Long id,
            @RequestParam Long consultantId) {
        return ResponseEntity.ok(appointmentService.claimAppointment(id, consultantId));
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT') ")
    public ResponseEntity<AppointmentResponseDto> approveAppointment(
            @PathVariable Long id,
            @RequestParam Long consultantId,
            @RequestBody AppointmentApproveRequest request) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id, consultantId, request.getLinkGoogleMeet()));
    }
    
    @PutMapping("/{id}/start")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT')")
    public ResponseEntity<AppointmentResponseDto> startAppointment(
            @PathVariable Long id,
            @RequestParam Long consultantId) {
        return ResponseEntity.ok(appointmentService.startAppointment(id, consultantId));
    }
    
    @PutMapping("/{id}/end")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT') ")
    public ResponseEntity<AppointmentResponseDto> endAppointment(
            @PathVariable Long id,
            @RequestParam Long consultantId,
            @RequestBody AppointmentEndRequest request) {
        return ResponseEntity.ok(appointmentService.endAppointment(id, consultantId, request.getConsultantNote()));
    }
    
    @PutMapping("/{id}/cancel/consultant")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_CONSULTANT') ")
    public ResponseEntity<AppointmentResponseDto> cancelAppointmentByConsultant(
            @PathVariable Long id,
            @RequestParam Long consultantId,
            @RequestBody AppointmentCancelConsultantRequest request) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByConsultant(id, consultantId, request.getReason()));
    }
    
    @PutMapping("/{id}/review/user")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MEMBER') ")
    public ResponseEntity<AppointmentResponseDto> reviewAppointment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody AppointmentReviewRequest request) {
        return ResponseEntity.ok(appointmentService.reviewAppointment(id, request.getReviewScore(), request.getCustomerReview(), userId));
    }
    
    @PutMapping("/{id}/review/guest")
    public ResponseEntity<AppointmentResponseDto> reviewAppointmentByGuest(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestBody AppointmentReviewRequest request) {
        return ResponseEntity.ok(appointmentService.reviewAppointmentByGuest(id, request.getReviewScore(), request.getCustomerReview(), email));
    }
} 