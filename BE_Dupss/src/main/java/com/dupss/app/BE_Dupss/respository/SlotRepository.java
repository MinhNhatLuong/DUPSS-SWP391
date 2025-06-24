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
//    List<Slot> findByConsultant(Consultant consultant);
//    List<Slot> findByConsultantAndDate(Consultant consultant, LocalDate date);
//    List<Slot> findByDateAndIsAvailable(LocalDate date, boolean isAvailable);
//    List<Slot> findByConsultantAndIsAvailable(Consultant consultant, boolean isAvailable);
//    List<Slot> findByConsultantAndDateAndIsAvailable(Consultant consultant, LocalDate date, boolean isAvailable);
//
//    @Query("SELECT s FROM Slot s WHERE s.consultant.id = :consultantId AND s.date = :date AND s.startTime <= :time AND s.endTime > :time AND s.isAvailable = true")
//    Optional<Slot> findAvailableSlotByConsultantAndDateTime(@Param("consultantId") Long consultantId,
//                                                            @Param("date") LocalDate date,
//                                                            @Param("time") LocalTime time);
} 