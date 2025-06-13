package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    
    @Query("SELECT p FROM PasswordResetOtp p WHERE p.email = :email AND p.used = false ORDER BY p.id DESC")
    Optional<PasswordResetOtp> findLatestOtpByEmail(String email);
    
    Optional<PasswordResetOtp> findByEmailAndOtpAndUsedFalse(String email, String otp);
} 