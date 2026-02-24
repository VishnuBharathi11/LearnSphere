package com.learnsphere.enrollment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FreeEnrollRequest {
    @NotBlank
    private String userId;
    @NotBlank
    private String courseId;
}
