package com.dupss.app.BE_Dupss.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/consultant")
@RequiredArgsConstructor
public class ConsultantController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Map<String, String>> getConsultantDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Consultant Dashboard",
                "role", "CONSULTANT"
        ));
    }

    @PostMapping("/consultations")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> createConsultation() {
        // Implement consultation creation logic here
        return ResponseEntity.ok(Map.of("message", "Consultation created successfully"));
    }
}