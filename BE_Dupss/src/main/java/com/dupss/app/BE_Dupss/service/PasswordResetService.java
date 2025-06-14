package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.ForgotPasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.ResetPasswordRequest;
import com.dupss.app.BE_Dupss.dto.response.ForgotPasswordResponse;
import com.dupss.app.BE_Dupss.dto.response.ResetPasswordResponse;

public interface PasswordResetService {
    
    /**
     * Gửi mã OTP đến email người dùng để đặt lại mật khẩu
     */
    ForgotPasswordResponse sendOtp(ForgotPasswordRequest request);
    
    /**
     * Xác thực mã OTP và đặt lại mật khẩu mới
     */
    ResetPasswordResponse resetPassword(ResetPasswordRequest request);
} 