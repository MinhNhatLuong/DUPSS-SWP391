package com.dupss.app.BE_Dupss.dto.request;

import com.dupss.app.BE_Dupss.entity.AcademicTitle;
import com.dupss.app.BE_Dupss.entity.ERole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotBlank(message = "Username không được để trống")
    private String username;
    
    @NotBlank(message = "Password không được để trống")
    private String password;
    
    @NotBlank(message = "Fullname không được để trống")
    private String fullname;
    
    private String gender;
    
    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;
    
    private String phone;
    
    private String address;
    
    @NotNull(message = "Role không được để trống")
    private ERole role;

    // Thông tin cho hồ sơ tư vấn viên
    private String bio;
    private String certificates;
    private AcademicTitle academicTitle;
} 