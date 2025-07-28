package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Entity đại diện cho một cuộc hẹn tư vấn trong hệ thống
 * Lưu trữ thông tin về người đặt lịch, thời gian, chủ đề và tư vấn viên
 */
@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    /**
     * ID của cuộc hẹn, tự động tăng
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên của khách hàng đặt lịch tư vấn
     */
    @Column(name = "customer_name", nullable = false)
    private String customerName;

    /**
     * Số điện thoại của khách hàng
     */
    @Column(name = "phone_number")
    private String phoneNumber;

    /**
     * Email của khách hàng, dùng để liên hệ và xác nhận cuộc hẹn
     */
    @Column(name = "email", nullable = false)
    private String email;

    /**
     * Ngày diễn ra cuộc hẹn tư vấn
     */
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    /**
     * Thời gian bắt đầu cuộc hẹn tư vấn
     */
    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    /**
     * Chủ đề của cuộc hẹn tư vấn
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    /**
     * Tư vấn viên được phân công cho cuộc hẹn
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consultant_id", nullable = true)
    private User consultant;

    /**
     * Đánh dấu người đặt lịch là khách vãng lai (true) hoặc thành viên đã đăng ký (false)
     */
    @Column(name = "is_guest", nullable = false)
    private boolean isGuest = true;

    /**
     * Người dùng đã đăng ký đặt lịch (nếu không phải khách vãng lai)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Trạng thái của cuộc hẹn: PENDING (đang chờ), CONFIRMED (đã xác nhận), 
     * CANCELED (đã hủy), COMPLETED (đã hoàn thành), ON_GOING (đang diễn ra)
     */
    @Column(name = "status")
    private String status = "PENDING";

    /**
     * Thời điểm tư vấn viên bắt đầu cuộc hẹn (check-in)
     */
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    /**
     * Thời điểm tư vấn viên kết thúc cuộc hẹn (check-out)
     */
    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    /**
     * Ghi chú của tư vấn viên sau khi hoàn thành cuộc hẹn
     */
    @Column(name = "consultant_note", length = 1000)
    private String consultantNote;

    /**
     * Điểm đánh giá của khách hàng (1-5 sao)
     */
    @Column(name = "review_score")
    private Integer reviewScore;

    /**
     * Nội dung đánh giá/nhận xét của khách hàng
     */
    @Column(name = "customer_review", length = 1000)
    private String customerReview;

    /**
     * Đánh dấu cuộc hẹn đã được đánh giá hay chưa
     */
    @Column(name = "is_review", nullable = false)
    private boolean isReview = false;

    /**
     * Đường link đến phòng họp trực tuyến
     */
    @Column(name = "dupss_meet_link", length = 500)
    private String linkMeet;
}