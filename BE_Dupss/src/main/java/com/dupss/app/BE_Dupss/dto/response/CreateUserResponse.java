package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.AcademicTitle;
import com.dupss.app.BE_Dupss.entity.ERole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateUserResponse {
    private Long id;
    private String username;
    private String fullname;
    private String email;
    private String phone;
    private String address;
    private ERole role;
    // Thông tin cho hồ sơ tư vấn viên
    private String bio;
    private String certificates;
    private AcademicTitle academicTitle;
    private String message;
} 