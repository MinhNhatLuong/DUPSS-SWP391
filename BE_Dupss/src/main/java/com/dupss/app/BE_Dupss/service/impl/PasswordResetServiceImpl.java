package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.ForgotPasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.ResetPasswordRequest;
import com.dupss.app.BE_Dupss.dto.response.ForgotPasswordResponse;
import com.dupss.app.BE_Dupss.dto.response.ResetPasswordResponse;
import com.dupss.app.BE_Dupss.entity.PasswordResetOtp;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.PasswordResetOtpRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.PasswordResetService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final EmailServiceImpl mailService;
    private final TemplateEngine templateEngine;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public ForgotPasswordResponse sendOtp(ForgotPasswordRequest request) {
        // Kiểm tra email có tồn tại trong hệ thống không
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + request.getEmail()));
        
        // Tạo mã OTP ngẫu nhiên 4 chữ số
        String otp = generateOtp();
        
        // Lưu OTP vào database
        PasswordResetOtp passwordResetOtp = PasswordResetOtp.builder()
                .email(request.getEmail())
                .otp(otp)
                .used(false)
                .build();
        
        otpRepository.save(passwordResetOtp);
        
        // Gửi email chứa OTP
        try {
            sendOtpEmail(request.getEmail(), otp);
            return ForgotPasswordResponse.builder()
                    .success(true)
                    .message("Mã OTP đã được gửi đến email của bạn")
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi gửi email OTP: {}", e.getMessage());
            return ForgotPasswordResponse.builder()
                    .success(false)
                    .message("Không thể gửi mã OTP, vui lòng thử lại sau")
                    .build();
        }
    }

    @Override
    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        // Kiểm tra email có tồn tại không
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + request.getEmail()));
        
        // Kiểm tra OTP có hợp lệ không
        PasswordResetOtp passwordResetOtp = otpRepository.findByEmailAndOtpAndUsedFalse(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new ResourceNotFoundException("Mã OTP không hợp lệ hoặc đã hết hạn"));
        
        // Kiểm tra OTP có hết hạn không
        if (passwordResetOtp.isExpired()) {
            return ResetPasswordResponse.builder()
                    .success(false)
                    .message("Mã OTP đã hết hạn, vui lòng yêu cầu mã mới")
                    .build();
        }
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Đánh dấu OTP đã sử dụng
        passwordResetOtp.setUsed(true);
        otpRepository.save(passwordResetOtp);
        
        return ResetPasswordResponse.builder()
                .success(true)
                .message("Đặt lại mật khẩu thành công")
                .build();
    }
    
    /**
     * Tạo mã OTP ngẫu nhiên 4 chữ số
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 1000 + random.nextInt(9000); // Tạo số ngẫu nhiên từ 1000 đến 9999
        return String.valueOf(otp);
    }
    
    /**
     * Gửi email chứa mã OTP
     */
    private void sendOtpEmail(String email, String otp) throws MessagingException, UnsupportedEncodingException {
        // Tạo context cho Thymeleaf template
        Context context = new Context();
        context.setVariable("otp", otp);
        
        // Xử lý template
        String emailContent = templateEngine.process("email/reset-password-otp", context);
        
        // Gửi email
        mailService.sendEmail("Mã xác nhận đặt lại mật khẩu DUPSS", emailContent, email);
    }
} 