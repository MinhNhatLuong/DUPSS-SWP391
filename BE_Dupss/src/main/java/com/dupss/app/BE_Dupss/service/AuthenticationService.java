package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.ChangePasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.LoginRequest;
import com.dupss.app.BE_Dupss.dto.request.LogoutRequest;
import com.dupss.app.BE_Dupss.dto.request.RefreshTokenRequest;
import com.dupss.app.BE_Dupss.dto.response.ChangePasswordResponse;
import com.dupss.app.BE_Dupss.dto.response.LoginResponse;
import com.dupss.app.BE_Dupss.dto.response.RefreshTokenResponse;
import com.dupss.app.BE_Dupss.entity.InvalidatedToken;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.InvalidatedTokenRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.nimbusds.jwt.SignedJWT;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.text.ParseException;
import java.util.Date;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        try{
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            User user = (User) authentication.getPrincipal();

            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();
        }catch (BadCredentialsException e) {
            throw e;
        }
    }

    public void logout(LogoutRequest request) throws ParseException {
        // 1. Kiểm tra xem token đó có phải là token của hệ thống mình sản xuất ra hay không
        SignedJWT signedJWT = SignedJWT.parse(request.getAccessToken());

        // 2. Đánh dấu token đó hết hiệu lực, và không có quyền truy cập vào hệ thống nữa, dù cho thời gian token còn hiệu lực
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(signedJWT.getJWTClaimsSet().getJWTID())
                .token(request.getAccessToken())
                .expirationTime(signedJWT.getJWTClaimsSet().getExpirationTime())
                .build();
        // 3. Lưu token vào data, từ lần sau kiểm tra token người dùng gửi có trong database hay không
        invalidatedTokenRepository.save(invalidatedToken);
        log.info("Logout successfully");
    }

    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) throws ParseException {
        if(StringUtils.isBlank(request.getRefreshToken()))
            throw new RuntimeException("Token cannot be blank");

        SignedJWT signedJWT = SignedJWT.parse(request.getRefreshToken());

        if(signedJWT.getJWTClaimsSet().getExpirationTime().before(new Date()))
            throw new RuntimeException("Token expired time");

        Optional<InvalidatedToken> invalidatedToken = invalidatedTokenRepository.findById(signedJWT.getJWTClaimsSet().getJWTID());
        if(invalidatedToken.isPresent())
            throw new RuntimeException("Token expired time");

        String username = signedJWT.getJWTClaimsSet().getSubject();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);

        return RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public ResponseEntity<ChangePasswordResponse> changePassword(ChangePasswordRequest request, String username) {
        try {
            // Lấy thông tin người dùng
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Xác thực mật khẩu cũ
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ChangePasswordResponse.builder()
                                .success(false)
                                .message("Mật khẩu cũ không chính xác")
                                .build());
            }

            // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
            if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ChangePasswordResponse.builder()
                                .success(false)
                                .message("Mật khẩu mới không được trùng với mật khẩu cũ")
                                .build());
            }

            // Cập nhật mật khẩu mới
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            // Gửi email thông báo
            LocalDateTime now = LocalDateTime.now();
            emailService.sendPasswordChangedEmail(user.getEmail(), user.getFullname(), now);

            return ResponseEntity.ok(ChangePasswordResponse.builder()
                    .success(true)
                    .message("Đổi mật khẩu thành công")
                    .build());
        } catch (Exception e) {
            log.error("Lỗi khi đổi mật khẩu: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ChangePasswordResponse.builder()
                            .success(false)
                            .message("Đã xảy ra lỗi: " + e.getMessage())
                            .build());
        }
    }

}

