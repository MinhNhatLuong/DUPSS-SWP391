package com.dupss.app.BE_Dupss.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Map<String, String>> getStaffDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Staff Dashboard",
                "role", "STAFF"
        ));
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> createTask() {
        // Implement task creation logic here
        return ResponseEntity.ok(Map.of("message", "Task created successfully"));
    }
}