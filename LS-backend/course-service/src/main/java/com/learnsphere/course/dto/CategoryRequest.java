package com.learnsphere.course.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class CategoryRequest {
	@NotBlank
	private String name;
	private String description;	
}
