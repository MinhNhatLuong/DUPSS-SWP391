package com.dupss.app.BE_Dupss.dto.request;

import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.validation.PasswordMatch;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@PasswordMatch
public class RegisterRequest {

    @NotEmpty(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotEmpty(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotEmpty(message = "Confirm password cannot be empty")
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

    private ERole role = ERole.ROLE_MEMBER; // Default role is MEMBER

}
