//package com.dupss.app.BE_Dupss.config;
//
//import java.util.Arrays;
//import java.util.List;
//
//import com.dupss.app.BE_Dupss.service.CustomOAuth2UserService;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Lazy;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.oauth2.jwt.JwtDecoder;
//import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
//import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import com.dupss.app.BE_Dupss.service.UserDetailServiceCustomizer;
//
//import lombok.RequiredArgsConstructor;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final JwtDecoder jwtDecoder;
//    private final UserDetailServiceCustomizer userDetailsService;
//    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
//    private final CustomOAuth2UserService customOAuth2UserService;
//    private final @Lazy OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
//
//    // Danh sách các đường dẫn công khai (WHITE LIST)
//    private static final String[] WHITE_LIST = {
//            // Auth endpoints
//            "/api/auth/**",
//            "/api/public/**",
//            // Swagger endpoints
//            "/swagger-ui/**",
//            "/v3/api-docs/**",
//            "/swagger-ui.html",
//            // Appointment endpoints cho guest
//            "/api/appointments",
//            "/api/appointments/guest",
//            "/api/appointments/*/cancel/guest",
//            "/api/appointments/{id}/review",
//            "/api/appointments/{id}",
//            // Slot endpoints
//            "/api/slots/available",
//            // Topic và consultant endpoints
//            "/api/topics",
//            //Chat box
//            "/chat/**"
//    };
//
//    // Các đường dẫn API chỉ dành cho ADMIN
//    private static final String[] ADMIN_ENDPOINTS = {
//            "/api/admin/**"
//    };
//    // Các đường dẫn API dành cho ADMIN và MANAGER
//    private static final String[] MANAGER_ENDPOINTS = {
//            "/api/manager/**"
//    };
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
//        return authConfig.getAuthenticationManager();
//    }
//
//    @Bean
//    public AuthenticationManager authManager(HttpSecurity http) throws Exception {
//
//        AuthenticationManagerBuilder authenticationManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
//
//
//        authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
//        return authenticationManagerBuilder.build();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public JwtAuthenticationConverter jwtAuthenticationConverter() {
//        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
//        grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities");
//        grantedAuthoritiesConverter.setAuthorityPrefix("");
//
//        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
//        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
//        return jwtAuthenticationConverter;
//    }
//
//    @Bean
//    CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000", "https://dupss.vercel.app/" , "http://34.87.106.55:5173" , "http://34.87.106.55:3000", "http://34.87.106.55:8080" , "http://34.87.106.55:8080/api/" , "https://admin.dupssapp.id.vn/api","https://dupssapp.id.vn/api",
//                "https://dupssapp.id.vn", "https://admin.dupssapp.id.vn"));
//        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
//        configuration.setAllowedHeaders(List.of("*"));
//        configuration.setExposedHeaders(List.of("Authorization"));
//        configuration.setAllowCredentials(true);
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }
//
////    @Bean
////    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
////        http
////                .csrf(AbstractHttpConfigurer::disable)
////                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
////                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
////                .authorizeHttpRequests(auth ->
////                        auth.requestMatchers(WHITE_LIST).permitAll()
////                                .requestMatchers(ADMIN_ENDPOINTS).hasAuthority("ROLE_ADMIN")
////                                .requestMatchers(MANAGER_ENDPOINTS).hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
////                                .anyRequest().authenticated()
////                )
////                .exceptionHandling(exception -> exception
////                        .authenticationEntryPoint(authenticationEntryPoint)
////                )
////                .oauth2ResourceServer(oauth2 -> oauth2
////                        .jwt(jwt -> jwt
////                                .decoder(jwtDecoder)
////                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
////                        )
////
////                );
////
////        return http.build();
//             @Bean
//             public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//                http
//            .csrf(AbstractHttpConfigurer::disable)
//            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//            .authorizeHttpRequests(auth -> auth
//                    .requestMatchers(WHITE_LIST).permitAll()
//                    .requestMatchers(ADMIN_ENDPOINTS).hasAuthority("ROLE_ADMIN")
//                    .requestMatchers(MANAGER_ENDPOINTS).hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
//                    .anyRequest().authenticated()
//            )
//            .exceptionHandling(exception -> exception
//                    .authenticationEntryPoint(authenticationEntryPoint)
//            )
//            .oauth2Login(oauth2 -> oauth2
//                    .loginPage("/login") // nếu có trang login tùy chỉnh
//                    .userInfoEndpoint(userInfo -> userInfo
//                            .userService(customOAuth2UserService)
//                    )
//                    .successHandler(oAuth2LoginSuccessHandler)
//            )
//            .oauth2ResourceServer(oauth2 -> oauth2
//                    .jwt(jwt -> jwt
//                            .decoder(jwtDecoder)
//                            .jwtAuthenticationConverter(jwtAuthenticationConverter())
//                    )
//            );
//
//    return http.build();
//}
//
//}
//
package com.dupss.app.BE_Dupss.config;

import com.dupss.app.BE_Dupss.service.JwtService;
import com.dupss.app.BE_Dupss.service.UserDetailServiceCustomizer;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtDecoder jwtDecoder;
    private final UserDetailServiceCustomizer userDetailsService;


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private static final String[] WHITE_LIST = {
            "/api/auth/**",
            "/api/public/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",
            "/api/appointments",
            "/api/appointments/guest",
            "/api/appointments/*/cancel/guest",
            "/api/appointments/{id}/review",
            "/api/appointments/{id}",
            "/api/slots/available",
            "/api/topics",
            "/chat/**"
    };

    private static final String[] ADMIN_ENDPOINTS = {
            "/api/admin/**"
    };

    private static final String[] MANAGER_ENDPOINTS = {
            "/api/manager/**"
    };

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("authorities");
        converter.setAuthorityPrefix("");
        JwtAuthenticationConverter authConverter = new JwtAuthenticationConverter();
        authConverter.setJwtGrantedAuthoritiesConverter(converter);
        return authConverter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173", "http://localhost:3000", "http://34.87.106.55:5173",
                "https://admin.dupssapp.id.vn", "https://dupssapp.id.vn","http://34.87.106.55:8080","http://34.87.106.55:3000"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(WHITE_LIST).permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers(ADMIN_ENDPOINTS).hasAuthority("ROLE_ADMIN")
                        .requestMatchers(MANAGER_ENDPOINTS).hasAnyAuthority("ROLE_MANAGER")
                        .requestMatchers("/api/staff/**").hasAnyAuthority("ROLE_STAFF")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

}
