package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.ForgotPasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.ResetPasswordRequest;
import com.dupss.app.BE_Dupss.dto.response.ForgotPasswordResponse;
import com.dupss.app.BE_Dupss.dto.response.ResetPasswordResponse;
import com.dupss.app.BE_Dupss.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth/password")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * API để gửi mã OTP qua email khi người dùng quên mật khẩu
     */
    @PostMapping("/forgot")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Nhận yêu cầu quên mật khẩu cho email: {}", request.getEmail());
        ForgotPasswordResponse response = passwordResetService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    /**
     * API để xác thực mã OTP và đặt lại mật khẩu mới
     */
    @PostMapping("/reset")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Nhận yêu cầu đặt lại mật khẩu cho email: {}", request.getEmail());
        ResetPasswordResponse response = passwordResetService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
} 