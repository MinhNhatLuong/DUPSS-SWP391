package com.dupss.app.BE_Dupss.controller;




import com.dupss.app.BE_Dupss.dto.request.CreateUserRequest;
import com.dupss.app.BE_Dupss.dto.request.UpdateUserRequest;
import com.dupss.app.BE_Dupss.dto.response.ActionLogResponse;
import com.dupss.app.BE_Dupss.dto.response.CreateUserResponse;

import com.dupss.app.BE_Dupss.dto.response.UpdateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.service.ActionLogService;
import com.dupss.app.BE_Dupss.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ActionLogService actionLogService;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserDetailResponse>> getAllUsers() {
        List<UserDetailResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
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

    @GetMapping("/actionLogs")
    public ResponseEntity<List<ActionLogResponse>> getAllActionLogs() {
        List<ActionLogResponse> actionLogs = actionLogService.getAllActionLog();
        return ResponseEntity.ok(actionLogs);
    }


    @PostMapping(value = "/users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<CreateUserResponse> createUser(@Valid @ModelAttribute CreateUserRequest request) {
        try {
            CreateUserResponse response = adminService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                CreateUserResponse.builder()
                    .message("Lỗi: " + e.getMessage())
                    .build()
            );
        }
    }


    @PatchMapping(value = "/users/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @ModelAttribute UpdateUserRequest request) {
        try {
            UpdateUserResponse response = adminService.updateUser(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Lỗi: " + e.getMessage())
            );
        }
    }



    @PatchMapping("/users/delete/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "Người dùng đã được xóa thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Lỗi: " + e.getMessage())
            );
        }
    }

}