package com.learnsphere.enrollment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnrollmentResponse {
	private String message;
	private Long enrollmentId;
}
