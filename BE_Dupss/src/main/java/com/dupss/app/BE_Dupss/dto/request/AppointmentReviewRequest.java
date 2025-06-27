package com.dupss.app.BE_Dupss.dto.request;

import lombok.Data;

@Data

public class AppointmentReviewRequest {
    private Integer reviewScore;
    private String customerReview;
    private String guestEmail;
} 