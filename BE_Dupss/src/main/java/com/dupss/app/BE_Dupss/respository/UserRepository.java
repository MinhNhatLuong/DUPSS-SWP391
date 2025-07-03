package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameAndEnabledTrue(String username);
    Optional<User> findByUsername(String username);
    List<User> findAllByEnabled(boolean enabled);

    List<User> findByRoleAndEnabled(ERole role, boolean enabled);

    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);

    List<User> findByEnabledTrue();
    User findByIdAndEnabledTrue(Long id);
}
