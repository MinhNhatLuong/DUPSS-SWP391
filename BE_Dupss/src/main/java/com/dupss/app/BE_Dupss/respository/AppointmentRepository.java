package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Appointment;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByConsultantOrderByAppointmentDateDesc(User consultant);

    List<Appointment> findByUser(User user);

    List<Appointment> findByAppointmentDate(LocalDate date);

    List<Appointment> findByIsGuestAndEmailOrderByAppointmentDateDesc(boolean isGuest, String email);

    long countByUserIdAndAppointmentDateAndStatusNot(Long userId, LocalDate date, String status);

    long countByEmailAndAppointmentDateAndStatusNot(String email, LocalDate date, String status);

    /**
     * Tìm các cuộc hẹn của một tư vấn viên với trạng thái đã hoàn thành hoặc đã hủy
     */
    List<Appointment> findByConsultantAndStatusIn(User consultant, List<String> statuses);

    /**
     * Tìm các cuộc hẹn theo trạng thái
     */
    List<Appointment> findByStatus(String status);

    List<Appointment> findByStatusInOrderByCheckOutTimeDesc(List<String> statuses);

    //    boolean existsByAppointmentDateAndAppointmentTime(LocalDate date, LocalTime time);
    @Query("""
                SELECT COUNT(a) > 0
                FROM Appointment a
                WHERE a.appointmentDate = :date
                  AND a.appointmentTime = :time
                  AND a.status <> 'CANCELED'
            """)
    boolean existsByDateTimeAndStatusNotCancelled(
            @Param("date") LocalDate date,
            @Param("time") LocalTime time
    );
} 