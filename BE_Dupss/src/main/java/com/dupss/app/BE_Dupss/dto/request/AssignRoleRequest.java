package com.dupss.app.BE_Dupss.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class AssignRoleRequest {
    @NotBlank(message = "Role name không được để trống")
    private String roleName;
}