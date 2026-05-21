package com.learnsphere.certificate.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class VerificationResponse {
    private boolean valid;
    private String certificateId;
    private String studentName;
    private String courseTitle;
    private String instructorName;
    private Instant issuedAt;
    private String status;
    private String message;
}
