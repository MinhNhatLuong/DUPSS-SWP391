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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final MailService mailService;
//    private final MailService mailService;

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
                    .name("ROLE_MEMBER")
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
            mailService.sendEmail("Welcome", "Chào mừng bạn đã đến với hệ thống Elearning của chúng tôi", user.getEmail());
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
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .avatar(user.getAvatar())
                        .build())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PreAuthorize("hasAuthority('ADMIN')") // => ROLE_USER, ROLE_USER
    public List<UserDetailResponse> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(user -> UserDetailResponse.builder()
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .avatar(user.getAvatar())
                        .build())
                .toList();
    }

