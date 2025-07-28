
package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.AccessTokenRequest;
import com.dupss.app.BE_Dupss.dto.request.LoginRequest;
import com.dupss.app.BE_Dupss.dto.request.RegisterRequest;
import com.dupss.app.BE_Dupss.dto.request.UpdateUserRequest;
import com.dupss.app.BE_Dupss.dto.response.*;
import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.Slot;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.SlotRepository;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


public interface UserService {

    void createAdminUserIfNotExists();

    RegisterResponse createUser(RegisterRequest request);

    UserDetailResponse getUserById(Long id);

    List<UserDetailResponse> getAllUsers();

    UserDetailResponse getCurrentUserInfo(AccessTokenRequest accessToken);

    UpdateUserResponse updateUserProfile(UpdateUserRequest request) throws IOException;

    List<ConsultantResponse> getAllConsultants();


}
