package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class LoginRequest {
    @NotBlank (message = "Tên đăng nhập không được để trống")
    private String username;
    @NotBlank (message = "Mật khẩu không được để trống")
    private String password;
}
