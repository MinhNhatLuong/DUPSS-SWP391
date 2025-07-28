package com.dupss.app.BE_Dupss.util;

import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
