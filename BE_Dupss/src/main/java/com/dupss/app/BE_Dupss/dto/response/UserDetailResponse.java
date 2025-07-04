package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.AcademicTitle;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@Builder
public class UserDetailResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String gender;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate yob;
    private String avatar;
    private String address;
    private String bio;
    private String certificates;
    private AcademicTitle academicTitle;
    private String role;
}
