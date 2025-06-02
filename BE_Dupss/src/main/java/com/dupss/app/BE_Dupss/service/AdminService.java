package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.Role;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.RoleRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

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
                    .filter(user -> user.getRoles().stream()
                            .anyMatch(role -> role.getName() == eRole))
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
            Role role = roleRepository.findByName(eRole)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

            Set<Role> roles = user.getRoles();
            if (roles == null) {
                roles = new HashSet<>();
            }
            roles.add(role);
            user.setRoles(roles);
            userRepository.save(user);
            log.info("Role {} assigned to user {}", roleName, userId);
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName);
            throw new IllegalArgumentException("Invalid role name: " + roleName);
        }
    }

    @Transactional
    public void removeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        try {
            ERole eRole = ERole.valueOf(roleName);
            Set<Role> roles = user.getRoles();
            if (roles != null) {
                roles = roles.stream()
                        .filter(role -> role.getName() != eRole)
                        .collect(Collectors.toSet());
                user.setRoles(roles);
                userRepository.save(user);
                log.info("Role {} removed from user {}", roleName, userId);
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName);
            throw new IllegalArgumentException("Invalid role name: " + roleName);
        }
    }

    private UserDetailResponse mapToUserDetailResponse(User user) {
        return UserDetailResponse.builder()
                .email(user.getEmail())
                .firstName(user.getUsername())
                .lastName(user.getFullname())
                .avatar(user.getAddress())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .toList())
                .build();
    }
}