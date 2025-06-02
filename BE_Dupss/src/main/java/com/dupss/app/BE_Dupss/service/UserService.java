package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.LoginRequest;
import com.dupss.app.BE_Dupss.dto.request.RegisterRequest;
import com.dupss.app.BE_Dupss.dto.response.LoginResponse;
import com.dupss.app.BE_Dupss.dto.response.RegisterResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.Role;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.RoleRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
public class UserService implements CommandLineRunner {

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Value("${admin.email:admin@example.com}")
    private String adminEmail;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final MailService mailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       RoleRepository roleRepository, MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.mailService = mailService;
    }

    @Override
    public void run(String... args) throws Exception {
        createAdminUserIfNotExists();
    }

    private void createAdminUserIfNotExists() {
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            log.info("Creating admin user: {}", adminUsername);

            User adminUser = User.builder()
                    .username(adminUsername)
                    .fullname("Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .roles(new HashSet<>())
                    .build();

            Optional<Role> adminRole = roleRepository.findByName(ERole.ROLE_ADMIN);
            if (adminRole.isPresent()) {
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole.get());
                adminUser.setRoles(roles);
                userRepository.save(adminUser);
                log.info("Admin user created successfully");
            } else {
                log.error("Admin role not found. Please ensure RoleInitializer has run first.");
            }
        }
    }

    public RegisterResponse createUser(RegisterRequest request) {
        Optional<User> byEmail = userRepository.findByEmail(request.getEmail());
        if(byEmail.isPresent()) {
            throw new RuntimeException("Email existed");
        }

        User user = User.builder()
                .username(request.getUsername())
                .fullname(request.getFullname())
                .gender(request.getGender())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(new HashSet<>())
                .build();

        Optional<Role> role = roleRepository.findByName(ERole.ROLE_MEMBER);
        if(role.isEmpty()) {
            Role newRole = Role.builder()
                    .name(ERole.ROLE_MEMBER)
                    .build();
            roleRepository.save(newRole);
            Set<Role> roles = new HashSet<>();
            roles.add(newRole);
            user.setRoles(roles);
        } else {
            Set<Role> roles = new HashSet<>();
            roles.add(role.get());
            user.setRoles(roles);
        }

        userRepository.save(user);

        try {
            mailService.sendEmail("Welcome", "Chào mừng bạn đã đến với Phần mềm hỗ trợ phòng ngừa sử dụng ma túy", user.getEmail());
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
                        .firstName(user.getUsername())
                        .lastName(user.getFullname())
                        .avatar(user.getAddress())
                        .build())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<UserDetailResponse> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(user -> UserDetailResponse.builder()
                        .email(user.getEmail())
                        .firstName(user.getUsername())
                        .lastName(user.getFullname())
                        .avatar(user.getAddress())
                        .build())
                .toList();
    }
}

