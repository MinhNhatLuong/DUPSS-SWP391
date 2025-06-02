package com.dupss.app.BE_Dupss.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserDetailResponse {
    private String email;
    private String firstName;
    private String lastName;
    private String avatar;
    private String role;
}
