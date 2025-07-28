package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.request.ChangePasswordRequest;
import com.dupss.app.BE_Dupss.dto.request.LoginRequest;
import com.dupss.app.BE_Dupss.dto.request.LogoutRequest;
import com.dupss.app.BE_Dupss.dto.request.RefreshTokenRequest;
import com.dupss.app.BE_Dupss.dto.response.ChangePasswordResponse;
import com.dupss.app.BE_Dupss.dto.response.LoginResponse;
import com.dupss.app.BE_Dupss.dto.response.RefreshTokenResponse;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.InvalidatedToken;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.InvalidatedTokenRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.nimbusds.jwt.SignedJWT;
import io.micrometer.common.util.StringUtils;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.ParseException;
import java.util.*;
import java.time.LocalDateTime;


public interface AuthenticationService {

     LoginResponse login(LoginRequest request);

     Map<String, String> loginWithGoogle(String idTokenString) throws GeneralSecurityException, IOException, MessagingException;

     void logout(LogoutRequest request) throws ParseException;

     ResponseEntity<ChangePasswordResponse> changePassword(ChangePasswordRequest request, String username);

     RefreshTokenResponse refreshToken(RefreshTokenRequest request) throws ParseException;

}

