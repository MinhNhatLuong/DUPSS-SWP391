package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SlotRequestDto;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.dto.response.ConsultantResponse;
import com.dupss.app.BE_Dupss.dto.response.SlotResponseDto;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.AppointmentRepository;
import com.dupss.app.BE_Dupss.respository.SlotRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import com.dupss.app.BE_Dupss.service.ConsultantService;
import com.dupss.app.BE_Dupss.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/consultant")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultantController {

    private final UserRepository consultantRepository;
    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final SlotService slotService;
    private final ConsultantService consultantService;

    /**
     * API lấy tất cả tư vấn viên đang hoạt động
     * Phục vụ cho việc hiển thị danh sách tư vấn viên khi đặt lịch
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllConsultants() {
        List<User> consultants = consultantRepository.findByEnabledTrue();
        return ResponseEntity.ok(consultants);
    }

    /**
     * API lấy tư vấn viên theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getConsultantById(@PathVariable Long id) {
        return consultantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/consultations")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> createConsultation() {
        // Implement consultation creation logic here
        return ResponseEntity.ok(Map.of("message", "Consultation created successfully"));
    }
    
    /**
     * API lấy danh sách cuộc hẹn chưa được phân công
     * Chỉ dành cho tư vấn viên
     */
    @GetMapping("/appointments/unassigned")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<AppointmentResponseDto>> getUnassignedAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getUnassignedAppointments();
        return ResponseEntity.ok(appointments);
    }
    
    /**
     * API nhận cuộc hẹn chưa được phân công
     * Chỉ dành cho tư vấn viên
     */
    @PostMapping("/{consultantId}/appointments/{appointmentId}/claim")
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
    @GetMapping("/{consultantId}/appointments")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<AppointmentResponseDto>> getConsultantAppointments(
            @PathVariable Long consultantId) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByConsultantId(consultantId);
        return ResponseEntity.ok(appointments);
    }

    @PostMapping("/slot")
    public ResponseEntity<SlotResponseDto> createSlot(@RequestBody SlotRequestDto slot) {
        SlotResponseDto res = slotService.createSlot(slot);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/available")
    public ResponseEntity<List<ConsultantResponse>> getAvailableConsultants() {
        List<ConsultantResponse> consultants = consultantService.getAllConsultants();
        return ResponseEntity.ok(consultants);
    }
}