package com.learnsphere.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class InstructorApplicationResponse {
    private Long id;
    private String name;
    private String expertise;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String linkedin;
    private String status;
    private Instant createdAt;
    private Instant reviewedAt;
    private String reviewedBy;
}
