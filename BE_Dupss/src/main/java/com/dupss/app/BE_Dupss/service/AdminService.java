package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.CreateUserRequest;
import com.dupss.app.BE_Dupss.dto.response.CreateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDetailResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToUserDetailResponse)
                .toList();
    }

    public List<UserDetailResponse> getUsersByRole(String roleName) {
        try {
            ERole eRole = ERole.valueOf(roleName);
            return userRepository.findAll().stream()
                    .filter(user -> user.getRole() == eRole)
                    .map(this::mapToUserDetailResponse)
                    .toList();
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName);
            throw new IllegalArgumentException("Invalid role name: " + roleName);
        }
    }

    @Transactional
    public void assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        try {
            ERole eRole = ERole.valueOf(roleName);
            user.setRole(eRole);
            userRepository.save(user);
            log.info("Role {} assigned to user {}", roleName, userId);
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName);
            throw new IllegalArgumentException("Invalid role name: " + roleName);
        }
    }

    @Transactional
    public CreateUserResponse createUser(CreateUserRequest request) {
        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullname(request.getFullname())
                .gender(request.getGender())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        log.info("Admin created user: {}", savedUser.getUsername());

        return CreateUserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .fullname(savedUser.getFullname())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .address(savedUser.getAddress())
                .role(savedUser.getRole())
                .message("Tạo người dùng thành công")
                .build();
    }

    private UserDetailResponse mapToUserDetailResponse(User user) {
        return UserDetailResponse.builder()
                .email(user.getEmail())
                .firstName(user.getUsername())
                .lastName(user.getFullname())
                .avatar(user.getAddress())
                .role(user.getRole().name())
                .build();
    }
}