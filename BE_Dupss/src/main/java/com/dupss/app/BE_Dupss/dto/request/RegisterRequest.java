package com.dupss.app.BE_Dupss.dto.request;

import java.time.LocalDate;
import java.util.Date;

import com.dupss.app.BE_Dupss.validation.PasswordMatch;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@PasswordMatch
public class RegisterRequest {

    @NotEmpty(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]$",
            message = "Username phải có ít nhất 1 chữ cái và 1 số, không chứa khoảng trắng hoặc ký tự đặc biệt")
    private String username;

    @NotEmpty(message = "mât khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$",
             message = "Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt")
    private String password;

    @NotEmpty(message = "Xac nhận mật khẩu không được để trống")
    private String confirmPassword;

    @NotEmpty(message = "Full name cannot be empty")
    private String fullname;

    private String gender;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate yob;

    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    private String email;

    @Pattern(regexp = "(84|0[3|5|7|8|9])+([0-9]{8})\\b", message = "Phone invalid!!" )
    private String phone;

    private String address;

}
