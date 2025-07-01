package com.dupss.app.BE_Dupss.service;



import com.dupss.app.BE_Dupss.dto.request.CreateUserRequest;
import com.dupss.app.BE_Dupss.dto.request.UpdateUserRequest;


import com.dupss.app.BE_Dupss.dto.response.CreateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UpdateUserResponse;
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
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDetailResponse> getAllUsers() {
        List<User> users = userRepository.findAllByEnabled(true);
        return users.stream().map(this::mapToUserDetailResponse).collect(Collectors.toList());
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
                .enabled(true)
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

    @Transactional

    public UpdateUserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail()) &&
                userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (request.getFullname() != null) {
            user.setFullname(request.getFullname());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
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
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User updatedUser = userRepository.save(user);
        log.info("Admin updated user: {}", updatedUser.getUsername());

        return UpdateUserResponse.builder()

                .id(updatedUser.getId())

                .username(updatedUser.getUsername())

                .fullname(updatedUser.getFullname())
                .email(updatedUser.getEmail())
                .phone(updatedUser.getPhone())
                .address(updatedUser.getAddress())
                .role(updatedUser.getRole())
                .message("Cập nhật người dùng thành công")
                .build();
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));

        if(user.isEnabled()){
            user.setEnabled(false);
        }
        userRepository.save(user);
        log.info("Admin deleted user: {} with ID: {}", user.getUsername(), userId);
    }


    private UserDetailResponse mapToUserDetailResponse(User user) {
        return UserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullname())
                .yob(user.getYob())
                .gender(user.getGender())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole().name())
                .build();
    }
}