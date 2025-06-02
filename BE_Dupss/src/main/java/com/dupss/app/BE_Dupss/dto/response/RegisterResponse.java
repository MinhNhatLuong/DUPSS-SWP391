package com.dupss.app.BE_Dupss.dto.response;


import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterResponse {
    private String username;
    private String email;
    private String phone;
    private String fullname;
}
