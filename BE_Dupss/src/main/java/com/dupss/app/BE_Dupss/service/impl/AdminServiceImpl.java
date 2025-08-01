package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.CreateUserRequest;
import com.dupss.app.BE_Dupss.dto.request.UpdateUserRequest;
import com.dupss.app.BE_Dupss.dto.response.CreateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UpdateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.ActionLogRepo;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActionLogRepo actionLogRepo;

    @Override
    public List<UserDetailResponse> getAllUsers() {
        List<User> users = userRepository.findAllByEnabled(true);
        return users.stream().map(this::mapToUserDetailResponse).collect(Collectors.toList());
    }

    public List<UserDetailResponse> getUsersByRole(String roleName) {
        try {
            ERole eRole = ERole.valueOf(roleName);
            return userRepository.findAllByEnabled(true).stream()
                    .filter(user -> user.getRole() == eRole)
                    .map(this::mapToUserDetailResponse)
                    .toList();
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName);
            throw new IllegalArgumentException("Invalid role name: " + roleName);
        }
    }

    @Override
    @Transactional
    public CreateUserResponse createUser(CreateUserRequest request) {
        // Check if username already exists
        if (userRepository.findByUsernameAndEnabledTrue(request.getUsername()).isPresent()) {
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

        if (request.getRole() == ERole.ROLE_CONSULTANT) {
            Consultant consul = new Consultant();
            consul.setBio(request.getBio());
            consul.setCertificates(request.getCertificates());
            consul.setAcademicTitle(request.getAcademicTitle());
            consul.setUser(user);
            user.setConsultantProfile(consul);
        }

        User savedUser = userRepository.save(user);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminUsername = authentication.getName();
        User adminUser = userRepository.findByUsernameAndEnabledTrue(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin thực hiện thao tác"));
        ActionLog logEntry = new ActionLog();
        logEntry.setPerformedBy(adminUser);
        logEntry.setActionType(ActionType.CREATE);
        logEntry.setTargetType(TargetType.USER);
        logEntry.setTargetId(savedUser.getId());
        logEntry.setActionTime(LocalDateTime.now());

        actionLogRepo.save(logEntry);

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

    @Override
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
        if(request.getRole() == ERole.ROLE_CONSULTANT) {
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
        }

        User updatedUser = userRepository.save(user);
        ActionLog logEntry = new ActionLog();
        logEntry.setPerformedBy(updatedUser);
        logEntry.setActionType(ActionType.UPDATE);
        logEntry.setTargetType(TargetType.USER);
        logEntry.setTargetId(updatedUser.getId());
        logEntry.setActionTime(LocalDateTime.now());

        actionLogRepo.save(logEntry);
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

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));

        if(user.isEnabled()){
            user.setEnabled(false);
        }
        User savedUser = userRepository.save(user);

        ActionLog logEntry = new ActionLog();
        logEntry.setPerformedBy(savedUser);
        logEntry.setActionType(ActionType.DELETE);
        logEntry.setTargetType(TargetType.USER);
        logEntry.setTargetId(savedUser.getId());
        logEntry.setActionTime(LocalDateTime.now());

        actionLogRepo.save(logEntry);

        log.info("Admin deleted user: {} with ID: {}", user.getUsername(), userId);
    }


    private UserDetailResponse mapToUserDetailResponse(User user) {
//        return UserDetailResponse.builder()
//                .id(user.getId())
//                .username(user.getUsername())
//                .email(user.getEmail())
//                .fullName(user.getFullname())
//                .yob(user.getYob())
//                .gender(user.getGender())
//                .phone(user.getPhone())
//                .address(user.getAddress())
//                .avatar(user.getAvatar())
//                .role(user.getRole().name())
//                .build();
        UserDetailResponse.UserDetailResponseBuilder builder = UserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullname())
                .yob(user.getYob())
                .gender(user.getGender())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole().name());

        // Add consultant profile information if available
        if (user.getRole() == ERole.ROLE_CONSULTANT && user.getConsultantProfile() != null) {
            builder.bio(user.getConsultantProfile().getBio())
                    .certificates(user.getConsultantProfile().getCertificates())
                    .academicTitle(user.getConsultantProfile().getAcademicTitle());
        }

        return builder.build();
    }
}
