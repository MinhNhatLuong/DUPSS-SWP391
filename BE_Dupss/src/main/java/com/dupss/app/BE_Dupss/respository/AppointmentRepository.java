package com.dupss.app.BE_Dupss.respository;

import com.dupss.app.BE_Dupss.entity.Appointment;
import com.dupss.app.BE_Dupss.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByConsultant(User consultant);
    
    List<Appointment> findByUser(User user);
    
    List<Appointment> findByAppointmentDate(LocalDate date);
    
    List<Appointment> findByIsGuestAndEmailOrderByAppointmentDateDesc(boolean isGuest, String email);
    
    /**
     * Tìm các cuộc hẹn của một tư vấn viên với trạng thái đã hoàn thành hoặc đã hủy
     */
    List<Appointment> findByConsultantAndStatusIn(User consultant, List<String> statuses);
    
    /**
     * Tìm các cuộc hẹn theo trạng thái
     */
    List<Appointment> findByStatus(String status);
} 