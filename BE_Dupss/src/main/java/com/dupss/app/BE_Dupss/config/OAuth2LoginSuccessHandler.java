//package com.dupss.app.BE_Dupss.config;
//
//import com.dupss.app.BE_Dupss.entity.User;
//import com.dupss.app.BE_Dupss.entity.ERole;
//import com.dupss.app.BE_Dupss.respository.UserRepository;
//import com.dupss.app.BE_Dupss.service.JwtService;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//
//import java.io.IOException;
//import java.util.Optional;
//
//@RequiredArgsConstructor
//public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
//
//    private final UserRepository userRepository;
//    private final JwtService jwtService;
//    private final PasswordEncoder passwordEncoder;
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request,
//                                        HttpServletResponse response,
//                                        Authentication authentication) throws IOException, ServletException {
//
//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//        String email = oAuth2User.getAttribute("email");
//        String name = oAuth2User.getAttribute("name");
//
//        Optional<User> optionalUser = userRepository.findByEmail(email);
//        User user = optionalUser.orElseGet(() -> {
//            User newUser = new User();
//            newUser.setEmail(email);
//            newUser.setFullname(name);
//            newUser.setUsername(email);
//            newUser.setAvatar(oAuth2User.getAttribute("picture"));
//            newUser.setPassword(passwordEncoder.encode("oauth2_default_password"));
//            newUser.setRole(ERole.ROLE_MEMBER);
//            return userRepository.save(newUser);
//        });
//
//        String token = jwtService.generateAccessToken(user);
//        response.sendRedirect("http://localhost:5173/oauth2/success?token=" + token);
//    }
//}
package com.dupss.app.BE_Dupss.config;

import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.entity.ERole; // Đúng package chứa enum
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component // QUAN TRỌNG: để Spring quản lý bean
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("picture");

        Optional<User> optionalUser = userRepository.findByEmail(email);

        User user = optionalUser.orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullname(name);
            newUser.setUsername(email); // hoặc name không dấu
            newUser.setAvatar(avatar);
            newUser.setPassword(passwordEncoder.encode("oauth2_default_password"));
            newUser.setRole(ERole.ROLE_MEMBER); // role mặc định
            return userRepository.save(newUser);
        });

        // Tạo Access Token và Refresh Token
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Redirect về FE với cả 2 token
        String redirectUrl = "http://localhost:5173/oauth2/success"
                + "?access_token=" + accessToken
                + "&refresh_token=" + refreshToken;

        response.sendRedirect(redirectUrl);
    }
}
