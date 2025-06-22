package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.respository.AppointmentRepository;
import com.dupss.app.BE_Dupss.respository.ConsultantRepository;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultantController {

    private final ConsultantRepository consultantRepository;
    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;

    /**
     * API lấy tất cả tư vấn viên đang hoạt động
     * Phục vụ cho việc hiển thị danh sách tư vấn viên khi đặt lịch
     */
    @GetMapping("/api/consultants")
    public ResponseEntity<List<Consultant>> getAllConsultants() {
        List<Consultant> consultants = consultantRepository.findByEnabledTrue();
        return ResponseEntity.ok(consultants);
    }

    /**
     * API lấy tư vấn viên theo ID
     */
    @GetMapping("/api/consultants/{id}")
    public ResponseEntity<Consultant> getConsultantById(@PathVariable Long id) {
        return consultantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/consultant/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Map<String, String>> getConsultantDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Consultant Dashboard",
                "role", "CONSULTANT"
        ));
    }

    @PostMapping("/api/consultant/consultations")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> createConsultation() {
        // Implement consultation creation logic here
        return ResponseEntity.ok(Map.of("message", "Consultation created successfully"));
    }
    
    /**
     * API lấy danh sách cuộc hẹn chưa được phân công
     * Chỉ dành cho tư vấn viên
     */
    @GetMapping("/api/consultant/appointments/unassigned")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<AppointmentResponseDto>> getUnassignedAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getUnassignedAppointments();
        return ResponseEntity.ok(appointments);
    }
    
    /**
     * API nhận cuộc hẹn chưa được phân công
     * Chỉ dành cho tư vấn viên
     */
    @PostMapping("/api/consultant/{consultantId}/appointments/{appointmentId}/claim")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<AppointmentResponseDto> claimAppointment(
            @PathVariable Long consultantId,
            @PathVariable Long appointmentId) {
        AppointmentResponseDto appointment = appointmentService.claimAppointment(appointmentId, consultantId);
        return ResponseEntity.ok(appointment);
    }

    /**
     * API lấy danh sách cuộc hẹn của tư vấn viên
     * Chỉ dành cho tư vấn viên
     */
    @GetMapping("/api/consultant/{consultantId}/appointments")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<AppointmentResponseDto>> getConsultantAppointments(
            @PathVariable Long consultantId) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByConsultantId(consultantId);
        return ResponseEntity.ok(appointments);
    }
}