package com.dupss.app.BE_Dupss.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
}

