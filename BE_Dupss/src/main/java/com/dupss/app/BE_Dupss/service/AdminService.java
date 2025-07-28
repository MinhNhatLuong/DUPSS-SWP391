package com.dupss.app.BE_Dupss.service;
import com.dupss.app.BE_Dupss.dto.request.CreateUserRequest;
import com.dupss.app.BE_Dupss.dto.request.UpdateUserRequest;


import com.dupss.app.BE_Dupss.dto.response.CreateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UpdateUserResponse;
import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.respository.ActionLogRepo;
import com.dupss.app.BE_Dupss.respository.UserRepository;
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

public interface AdminService {

     List<UserDetailResponse> getAllUsers();

     List<UserDetailResponse> getUsersByRole(String roleName);

     CreateUserResponse createUser(CreateUserRequest request);

     UpdateUserResponse updateUser(Long userId, UpdateUserRequest request);

     void deleteUser(Long userId);
}