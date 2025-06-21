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
import com.dupss.app.BE_Dupss.service.EmailService;
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
    private final EmailService mailService;
    private final TemplateEngine templateEngine;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public ForgotPasswordResponse sendOtp(ForgotPasswordRequest request) {
        try {
            log.info("Bắt đầu xử lý yêu cầu quên mật khẩu cho email: {}", request.getEmail());
            
            // Kiểm tra email có tồn tại trong hệ thống không
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + request.getEmail()));
            
            // Tạo mã OTP ngẫu nhiên 4 chữ số
            String otp = generateOtp();
            log.info("Đã tạo mã OTP {} cho email {}", otp, request.getEmail());
            
            // Lưu OTP vào database
            PasswordResetOtp passwordResetOtp = PasswordResetOtp.builder()
                    .email(request.getEmail())
                    .otp(otp)
                    .used(false)
                    .build();
            
            PasswordResetOtp savedOtp = otpRepository.save(passwordResetOtp);
            log.info("Đã lưu mã OTP vào database với ID: {}", savedOtp.getId());
            
            // Gửi email chứa OTP
            try {
                sendOtpEmail(request.getEmail(), otp);
                log.info("Đã gửi mã OTP thành công đến email: {}", request.getEmail());
                
                return ForgotPasswordResponse.builder()
                        .success(true)
                        .message("Mã OTP đã được gửi đến email của bạn")
                        .build();
            } catch (MessagingException e) {
                log.error("Lỗi khi gửi email OTP: {}", e.getMessage(), e);
                return ForgotPasswordResponse.builder()
                        .success(false)
                        .message("Không thể gửi mã OTP qua email, vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau")
                        .build();
            } catch (UnsupportedEncodingException e) {
                log.error("Lỗi mã hóa khi gửi email OTP: {}", e.getMessage(), e);
                return ForgotPasswordResponse.builder()
                        .success(false)
                        .message("Lỗi hệ thống khi gửi mã OTP, vui lòng thử lại sau")
                        .build();
            } catch (Exception e) {
                log.error("Lỗi không xác định khi gửi email OTP: {}", e.getMessage(), e);
                return ForgotPasswordResponse.builder()
                        .success(false)
                        .message("Lỗi hệ thống khi gửi mã OTP, vui lòng thử lại sau")
                        .build();
            }
        } catch (ResourceNotFoundException e) {
            log.error("Email không tồn tại trong hệ thống: {}", request.getEmail());
            return ForgotPasswordResponse.builder()
                    .success(false)
                    .message("Không tìm thấy tài khoản với email này")
                    .build();
        } catch (Exception e) {
            log.error("Lỗi không xác định khi xử lý yêu cầu quên mật khẩu: {}", e.getMessage(), e);
            return ForgotPasswordResponse.builder()
                    .success(false)
                    .message("Lỗi hệ thống, vui lòng thử lại sau")
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
        try {
            // Tạo context cho Thymeleaf template
            Context context = new Context();
            context.setVariable("otp", otp);
            
            // Xử lý template
            String emailContent = templateEngine.process("email/reset-password-otp", context);
            
            // Gửi email - sửa thứ tự tham số cho đúng
            mailService.sendEmail(email, "Mã xác nhận đặt lại mật khẩu DUPSS", emailContent);
            
            log.info("Đã gửi mã OTP {} đến email {}", otp, email);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email OTP: {}", e.getMessage(), e);
            throw e;
        }
    }
} 