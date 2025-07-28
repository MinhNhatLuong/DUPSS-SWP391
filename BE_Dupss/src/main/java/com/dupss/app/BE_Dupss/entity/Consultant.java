package com.dupss.app.BE_Dupss.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity đại diện cho thông tin của một tư vấn viên trong hệ thống
 * Lưu trữ thông tin chuyên môn, học vị và tiểu sử của tư vấn viên
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultant {
    /**
     * ID của tư vấn viên, tự động tăng
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Danh sách các chứng chỉ mà tư vấn viên sở hữu
     */
    private String certificates;

    /**
     * Tiểu sử hoặc giới thiệu về tư vấn viên
     * Sử dụng NVARCHAR(5000) để hỗ trợ lưu trữ văn bản dài và đa ngôn ngữ
     */
    @Column(columnDefinition = "NVARCHAR(5000)")
    private String bio;

    /**
     * Học vị hoặc chức danh học thuật của tư vấn viên
     * Ví dụ: Tiến sĩ, Thạc sĩ, Giáo sư, v.v.
     */
    @Enumerated(EnumType.STRING)
    private AcademicTitle academicTitle;

    /**
     * Liên kết đến thông tin người dùng cơ bản của tư vấn viên
     * Mối quan hệ One-to-One với entity User
     */
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
