package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}