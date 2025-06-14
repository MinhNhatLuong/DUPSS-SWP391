package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "password_reset_otp")
public class PasswordResetOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    
    private String otp;
    
    private LocalDateTime expiryTime;
    
    private boolean used;
    
    @PrePersist
    public void setExpiryTime() {
        // OTP hết hạn sau 5 phút
        this.expiryTime = LocalDateTime.now().plusMinutes(5);
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryTime);
    }
} 