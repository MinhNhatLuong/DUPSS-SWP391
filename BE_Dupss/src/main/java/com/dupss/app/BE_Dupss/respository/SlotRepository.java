package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Slot;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByConsultant(User consultant);

    List<Slot> findByConsultantAndDateAndAvailable(User consultant, LocalDate date, boolean b);
    List<Slot> findByConsultantAndAvailableTrue(User consultant);
    Optional<Slot> findByConsultantAndDateAndStartTime(User consultant, LocalDate date, LocalTime startTime);
    boolean existsByConsultantAndDateAndStartTime(User consultant, LocalDate date, LocalTime startTime);
} 