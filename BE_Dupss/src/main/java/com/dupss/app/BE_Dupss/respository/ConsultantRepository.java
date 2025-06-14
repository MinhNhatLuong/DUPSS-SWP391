package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Consultant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    Optional<Consultant> findByEmail(String email);
    
    // Lấy danh sách tư vấn viên đang hoạt động
    List<Consultant> findByEnabledTrue();
} 