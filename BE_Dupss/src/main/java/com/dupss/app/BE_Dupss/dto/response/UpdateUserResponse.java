package com.dupss.app.BE_Dupss.dto.response;

import com.dupss.app.BE_Dupss.entity.ERole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserResponse {
    private Long id;
    private String fullname;
    private String email;
    private String phone;
    private String address;
    private ERole role;
    private String message;
}
