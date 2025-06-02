package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> getManagerDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Manager Dashboard",
                "role", "MANAGER"
        ));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public List<UserDetailResponse> getAllStaff() {
        return adminService.getUsersByRole("ROLE_STAFF");
    }

    @GetMapping("/consultants")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public List<UserDetailResponse> getAllConsultants() {
        return adminService.getUsersByRole("ROLE_CONSULTANT");
    }

    @PostMapping("/reports")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> generateReport() {
        // Implement report generation logic here
        return ResponseEntity.ok(Map.of("message", "Report generated successfully"));
    }
}