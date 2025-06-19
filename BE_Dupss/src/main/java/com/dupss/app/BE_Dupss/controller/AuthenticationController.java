package com.dupss.app.BE_Dupss.controller;


import com.dupss.app.BE_Dupss.dto.request.AccessTokenRequest;
import com.dupss.app.BE_Dupss.dto.request.LoginRequest;
import com.dupss.app.BE_Dupss.dto.request.LogoutRequest;
import com.dupss.app.BE_Dupss.dto.request.RefreshTokenRequest;
import com.dupss.app.BE_Dupss.dto.request.RegisterRequest;

import com.dupss.app.BE_Dupss.dto.request.UpdateUserRequest;
import com.dupss.app.BE_Dupss.dto.response.LoginResponse;
import com.dupss.app.BE_Dupss.dto.response.RefreshTokenResponse;
import com.dupss.app.BE_Dupss.dto.response.RegisterResponse;
import com.dupss.app.BE_Dupss.dto.response.UpdateUserResponse;

import com.dupss.app.BE_Dupss.dto.response.UserDetailResponse;
import com.dupss.app.BE_Dupss.service.AuthenticationService;
import com.dupss.app.BE_Dupss.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import org.springframework.http.MediaType;

import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.ParseException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) throws ParseException {
        RefreshTokenResponse response = authenticationService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody LogoutRequest request) throws ParseException {
        authenticationService.logout(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/me")
    public ResponseEntity<UserDetailResponse> getCurrentUser(@RequestBody AccessTokenRequest accessToken) {
        UserDetailResponse userInfo = userService.getCurrentUserInfo(accessToken);
        return ResponseEntity.ok(userInfo);
    }

    @PatchMapping(value="/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UpdateUserResponse> updateUser(@Valid @ModelAttribute UpdateUserRequest request) throws IOException {
        UpdateUserResponse response = userService.updateUserProfile(request);
        return ResponseEntity.ok(response);
    }

}