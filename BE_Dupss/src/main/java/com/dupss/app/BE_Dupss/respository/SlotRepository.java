package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByConsultant(Consultant consultant);
    List<Slot> findByConsultantAndDate(Consultant consultant, LocalDate date);
    List<Slot> findByDateAndIsAvailable(LocalDate date, boolean isAvailable);
    List<Slot> findByConsultantAndIsAvailable(Consultant consultant, boolean isAvailable);
    List<Slot> findByConsultantAndDateAndIsAvailable(Consultant consultant, LocalDate date, boolean isAvailable);
} 