
package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.AccessTokenRequest;
import com.dupss.app.BE_Dupss.dto.request.LoginRequest;
import com.dupss.app.BE_Dupss.dto.request.RegisterRequest;
import com.dupss.app.BE_Dupss.dto.request.UpdateUserRequest;
import com.dupss.app.BE_Dupss.dto.response.LoginResponse;
import com.dupss.app.BE_Dupss.dto.response.RegisterResponse;
import com.dupss.app.BE_Dupss.dto.response.UpdateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.impl.EmailServiceImpl;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService implements CommandLineRunner {

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Value("${admin.email:admin@example.com}")
    private String adminEmail;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService mailService;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;

    @Override
    public void run(String... args) throws Exception {
        createAdminUserIfNotExists();
    }

    private void createAdminUserIfNotExists() {
        if (userRepository.findByUsernameAndEnabledTrue(adminUsername).isEmpty() && 
            userRepository.findByEmail(adminEmail).isEmpty()) {
            log.info("Creating admin user: {}", adminUsername);

            User adminUser = User.builder()
                    .username(adminUsername)
                    .fullname("Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(ERole.ROLE_ADMIN)
                    .enabled(true)
                    .build();

            userRepository.save(adminUser);
            log.info("Admin user created successfully");
        } else {
            log.info("Admin user already exists, skipping creation");
        }
    }

    public RegisterResponse createUser(RegisterRequest request) {
        Optional<User> byEmail = userRepository.findByEmail(request.getEmail());
        Optional<User> byUsername = userRepository.findByUsernameAndEnabledTrue(request.getUsername());

        if (byUsername.isPresent()) {
            throw new RuntimeException("Username đã tồn tại");
        }

        if(byEmail.isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        String imgUser = "https://freesvg.org/img/abstract-user-flat-3.png";

        User user = User.builder()
                .username(request.getUsername())
                .fullname(request.getFullname())
                .gender(request.getGender())
                .yob(request.getYob())
                .email(request.getEmail())
                .avatar(imgUser)
                .phone(request.getPhone())
                .address(request.getAddress())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(ERole.ROLE_MEMBER)
                .enabled(true)
                .build();

        userRepository.save(user);

        try {
            mailService.sendWelcomeEmail(user.getEmail(), user.getFullname());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("SendEmail failed with email: {}", user.getEmail());
            throw new RuntimeException(e);
        }

        return RegisterResponse.builder()
                .username(user.getUsername())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }

    @PreAuthorize("isAuthenticated()")
    public UserDetailResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(user -> UserDetailResponse.builder()
                        .email(user.getEmail())
                        .fullName(user.getFullname())
                        .avatar(user.getAddress())
                        .role(user.getRole().name())
                        .build())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<UserDetailResponse> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(user -> UserDetailResponse.builder()
                        .email(user.getEmail())
                        .fullName(user.getFullname())
                        .avatar(user.getAvatar())
                        .role(user.getRole().name())
                        .build())
                .toList();
    }

//    @PreAuthorize("isAuthenticated()")
    public UserDetailResponse getCurrentUserInfo(AccessTokenRequest accessToken) {
        String token = accessToken.getAccessToken();

        // Kiểm tra token hợp lệ
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Access token is missing");
        }

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

//         Giải mã token để lấy username
        String username = jwtService.getUsernameFromToken(token);

        return userRepository.findByUsernameAndEnabledTrue(username)
                .map(user -> {
                    Consultant consultant = user.getConsultantProfile();
                    return UserDetailResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .fullName(user.getFullname())
                            .gender(user.getGender())
                            .yob(user.getYob())
                            .avatar(user.getAvatar())
                            .address(user.getAddress())
                            .bio(consultant != null ? consultant.getBio() : null)
                            .certificates(consultant != null ? consultant.getCertificates() : null)
                            .academicTitle(consultant != null ? consultant.getAcademicTitle() : null)
                            .role(user.getRole().name())
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UpdateUserResponse updateUserProfile(UpdateUserRequest request) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username: " + username));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) &&
                userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (request.getFullname() != null) {
            user.setFullname(request.getFullname());
        }

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(request.getAvatar());
            user.setAvatar(imageUrl);
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getYob() != null) {
            user.setYob(request.getYob());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if(user.getRole().equals(ERole.ROLE_CONSULTANT) || isAdmin){
            Consultant consultant = user.getConsultantProfile();

            if (request.getBio() != null) {
                consultant.setBio(request.getBio());
            }
            if (request.getCertificates() != null) {
                consultant.setCertificates(request.getCertificates());
            }
            if (request.getAcademicTitle() != null) {
                consultant.setAcademicTitle(request.getAcademicTitle());
            }
        } else if (request.getBio() != null || request.getCertificates() != null || request.getAcademicTitle() != null) {
            throw new RuntimeException("Bạn không có quyền thay đổi thông tin này");
        }

        if (request.getRole() != null) {
            if (isAdmin) {
                user.setRole(request.getRole());
            } else {
                throw new RuntimeException("Bạn không có quyền thay đổi vai trò người dùng");
            }
        }

        User updatedUser = userRepository.save(user);
        Consultant consultant = updatedUser.getConsultantProfile();
        log.info("Admin updated user: {}", updatedUser.getUsername());

        return UpdateUserResponse.builder()
                .username(updatedUser.getUsername())
                .fullname(updatedUser.getFullname())
                .avatar(updatedUser.getAvatar())
                .yob(updatedUser.getYob())
                .gender(updatedUser.getGender())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .address(updatedUser.getAddress())
                .bio(consultant != null ? consultant.getBio() : null)
                .certificates(consultant != null ? consultant.getCertificates() : null)
                .academicTitle(consultant != null ? consultant.getAcademicTitle() : null)
                .role(updatedUser.getRole())
                .message("Cập nhật người dùng thành công")
                .build();
    }
}
