package com.dupss.app.BE_Dupss.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultantResponse {
    private Long id;
    private String consultantName;
    private String avatar;
    private String certificates;
    private String bio;
}
