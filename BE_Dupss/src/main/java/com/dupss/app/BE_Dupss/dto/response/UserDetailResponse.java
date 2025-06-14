package com.dupss.app.BE_Dupss.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class UserDetailResponse {


    private String username;
    private String email;
    private String phone;
    private String fullName;
    private LocalDate yob;
    private String avatar;
    private String address;

    private String role;
}
