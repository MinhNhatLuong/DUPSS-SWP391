package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

/**
 * Entity đại diện cho một slot thời gian làm việc của tư vấn viên
 * Lưu trữ thông tin về ngày, giờ bắt đầu, giờ kết thúc và trạng thái khả dụng
 */
@Entity
@Table(name = "slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Slot {
    /**
     * ID của slot thời gian, tự động tăng
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Ngày của slot thời gian
     */
    @Column(name = "date", nullable = false)
    private LocalDate date;

    /**
     * Thời gian bắt đầu của slot
     */
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /**
     * Thời gian kết thúc của slot
     */
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /**
     * Trạng thái khả dụng của slot
     * true: slot còn trống và có thể đặt lịch
     * false: slot đã được đặt lịch hoặc không khả dụng
     */
    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    /**
     * Tư vấn viên sở hữu slot thời gian này
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consultant_id", nullable = false)
    private User consultant;
}