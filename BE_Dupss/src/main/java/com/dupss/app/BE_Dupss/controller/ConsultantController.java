package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SlotRequestDto;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.dto.response.ConsultantResponse;
import com.dupss.app.BE_Dupss.dto.response.SlotResponseDto;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.AppointmentRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import com.dupss.app.BE_Dupss.service.SlotService;
import com.dupss.app.BE_Dupss.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến tư vấn viên
 * Cung cấp các endpoint để quản lý tư vấn viên, lịch làm việc và cuộc hẹn
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/consultant")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultantController {

    private final UserRepository consultantRepository;
    private final AppointmentService appointmentService;
    private final AppointmentRepository appointmentRepository;
    private final SlotService slotService;
    private final UserService userService;

    /**
     * API lấy tất cả tư vấn viên đang hoạt động
     * Phục vụ cho việc hiển thị danh sách tư vấn viên khi đặt lịch
     * 
     * @return Danh sách các tư vấn viên có trạng thái enabled = true
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllConsultants() {
        List<User> consultants = consultantRepository.findByEnabledTrue();
        return ResponseEntity.ok(consultants);
    }

    /**
     * API lấy thông tin chi tiết của một tư vấn viên theo ID
     * 
     * @param id ID của tư vấn viên cần lấy thông tin
     * @return Thông tin chi tiết của tư vấn viên nếu tìm thấy, 404 nếu không tìm thấy
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getConsultantById(@PathVariable Long id) {
        return consultantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    /**
     * API lấy danh sách cuộc hẹn chưa được phân công cho tư vấn viên
     * Chỉ dành cho người dùng có vai trò tư vấn viên
     * 
     * @return Danh sách các cuộc hẹn chưa được phân công
     */
    @GetMapping("/appointments/unassigned")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<List<AppointmentResponseDto>> getUnassignedAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getUnassignedAppointments();
        return ResponseEntity.ok(appointments);
    }


    /**
     * API lấy danh sách cuộc hẹn của một tư vấn viên cụ thể
     * Chỉ dành cho người dùng có vai trò tư vấn viên hoặc quản lý
     * 
     * @param consultantId ID của tư vấn viên cần lấy danh sách cuộc hẹn
     * @return Danh sách các cuộc hẹn của tư vấn viên
     */
    @GetMapping("/{consultantId}/appointments")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_MANAGER')")
    public ResponseEntity<List<AppointmentResponseDto>> getConsultantAppointments(
            @PathVariable Long consultantId) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByConsultantId(consultantId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * API tạo slot thời gian làm việc mới cho tư vấn viên
     * 
     * @param slot Thông tin slot cần tạo (ngày, giờ bắt đầu, giờ kết thúc, tư vấn viên)
     * @return Thông tin slot đã được tạo
     */
    @PostMapping("/slot")
    public ResponseEntity<SlotResponseDto> createSlot(@RequestBody SlotRequestDto slot) {
        SlotResponseDto res = slotService.createSlot(slot);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    /**
     * API lấy danh sách tư vấn viên có sẵn để đặt lịch
     * Trả về thông tin chi tiết hơn so với API getAllConsultants
     * 
     * @return Danh sách các tư vấn viên có sẵn với thông tin chi tiết
     */
    @GetMapping("/available")
    public ResponseEntity<List<ConsultantResponse>> getAvailableConsultants() {
        List<ConsultantResponse> consultants = userService.getAllConsultants();
        return ResponseEntity.ok(consultants);
    }
}