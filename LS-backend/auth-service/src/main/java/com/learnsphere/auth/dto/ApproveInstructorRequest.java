package com.learnsphere.auth.dto;

import lombok.Data;

@Data
public class ApproveInstructorRequest {
    private String email;
    private String password;
}
