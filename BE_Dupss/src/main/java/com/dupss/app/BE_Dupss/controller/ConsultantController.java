package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.respository.ConsultantRepository;
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

    /**
     * API lấy tất cả tư vấn viên
     * Phục vụ cho việc hiển thị danh sách tư vấn viên khi đặt lịch
     */
    @GetMapping("/api/consultants")
    public ResponseEntity<List<Consultant>> getAllConsultants() {
        List<Consultant> consultants = consultantRepository.findAll();
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

    /**
     * API lấy tư vấn viên theo topic
     * Phục vụ cho việc hiển thị danh sách tư vấn viên theo chủ đề khi đặt lịch
     */
    @GetMapping("/api/consultants/topic/{topicId}")
    public ResponseEntity<List<Consultant>> getConsultantsByTopic(@PathVariable Long topicId) {
        List<Consultant> consultants = consultantRepository.findByTopicId(topicId);
        return ResponseEntity.ok(consultants);
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
}