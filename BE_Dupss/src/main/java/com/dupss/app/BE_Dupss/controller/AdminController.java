package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.AssignRoleRequest;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<UserDetailResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/users/staff")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public List<UserDetailResponse> getAllStaff() {
        return adminService.getUsersByRole("ROLE_STAFF");
    }

    @GetMapping("/users/consultants")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public List<UserDetailResponse> getAllConsultants() {
        return adminService.getUsersByRole("ROLE_CONSULTANT");
    }

    @PostMapping("/users/{userId}/roles")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> assignRole(@PathVariable Long userId, @RequestBody AssignRoleRequest request) {
        adminService.assignRoleToUser(userId, request.getRoleName());
        return ResponseEntity.ok(Map.of("message", "Role assigned successfully"));
    }

    @DeleteMapping("/users/{userId}/roles/{roleName}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> removeRole(@PathVariable Long userId, @PathVariable String roleName) {
        adminService.removeRoleFromUser(userId, roleName);
        return ResponseEntity.ok(Map.of("message", "Role removed successfully"));
    }
}