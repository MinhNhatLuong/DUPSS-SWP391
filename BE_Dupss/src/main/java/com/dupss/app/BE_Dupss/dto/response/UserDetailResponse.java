package com.dupss.app.BE_Dupss.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class UserDetailResponse {
    private String email;
    private String firstName;
    private String lastName;
    private String avatar;
    private List<String> roles;
}
