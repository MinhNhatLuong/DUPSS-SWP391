package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.ForgotPasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.ResetPasswordRequest;
import com.dupss.app.BE_Dupss.dto.response.ForgotPasswordResponse;
import com.dupss.app.BE_Dupss.dto.response.ResetPasswordResponse;
import com.dupss.app.BE_Dupss.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
        try {
            ForgotPasswordResponse response = passwordResetService.sendOtp(request);
            if (response.isSuccess()) {
                log.info("Gửi mã OTP thành công cho email: {}", request.getEmail());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Không thể gửi mã OTP cho email: {}, lý do: {}", request.getEmail(), response.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Lỗi không xử lý được khi gửi OTP cho email {}: {}", request.getEmail(), e.getMessage(), e);
            ForgotPasswordResponse errorResponse = ForgotPasswordResponse.builder()
                    .success(false)
                    .message("Lỗi hệ thống, vui lòng thử lại sau")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
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