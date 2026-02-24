package com.learnsphere.enrollment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequest {
	@NotBlank
	private String userId;
	@NotBlank
	private String courseId;
	private Integer amount;
}
