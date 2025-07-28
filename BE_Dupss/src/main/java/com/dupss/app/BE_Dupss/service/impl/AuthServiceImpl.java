package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.ChangePasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.LoginRequest;
import com.dupss.app.BE_Dupss.dto.request.LogoutRequest;
import com.dupss.app.BE_Dupss.dto.request.RefreshTokenRequest;
import com.dupss.app.BE_Dupss.dto.response.ChangePasswordResponse;
import com.dupss.app.BE_Dupss.dto.response.LoginResponse;
import com.dupss.app.BE_Dupss.dto.response.RefreshTokenResponse;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.InvalidatedToken;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.InvalidatedTokenRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.AuthenticationService;
import com.dupss.app.BE_Dupss.service.EmailService;
import com.dupss.app.BE_Dupss.service.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.nimbusds.jwt.SignedJWT;
import io.micrometer.common.util.StringUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Override
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

    @Override
    public Map<String, String> loginWithGoogle(String idTokenString) throws GeneralSecurityException, IOException, MessagingException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier
                .Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList("1089571551895-4acjf2karqm5kj3dg25pscae47745r6s.apps.googleusercontent.com"))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            throw new GeneralSecurityException("Invalid ID token.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;
        boolean isNewUser = false;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullname(name);
            newUser.setUsername(email);
            newUser.setAvatar(picture);
            newUser.setPassword(passwordEncoder.encode("oauth2_default_password"));
            newUser.setRole(ERole.ROLE_MEMBER);
            newUser.setEnabled(true);

            user = userRepository.save(newUser);
            isNewUser = true;
        }

        if (isNewUser) {
            emailService.sendWelcomeEmail(email, name);
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        return tokens;
    }

    @Override
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

    @Override
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

        User user = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);

        return RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    @Override
    public ResponseEntity<ChangePasswordResponse> changePassword(ChangePasswordRequest request, String username) {
        try {
            // Lấy thông tin người dùng
            User user = userRepository.findByUsernameAndEnabledTrue(username)
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
