package com.dupss.app.BE_Dupss.config;

import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.Role;
import com.dupss.app.BE_Dupss.respository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing roles...");

        // Khởi tạo tất cả các Role từ enum ERole
        Arrays.stream(ERole.values()).forEach(role -> {
            if (roleRepository.findByName(role).isEmpty()) {
                Role newRole = Role.builder()
                        .name(role)
                        .build();
                roleRepository.save(newRole);
                log.info("Created role: {}", role);
            }
        });

        log.info("Roles initialization completed.");
    }
}