package com.learnsphere.course.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CourseRequest {
	@NotBlank(message="Title is required")
	private String title;
	@NotBlank(message="Description is required")
	private String description;
	@NotNull(message="Price is required")
	@Positive(message = "Price must be greater than 0")
	@Min(0)
	private double price;
	@NotBlank(message = "Category ID is required")
	private String categoryId;
	@NotBlank(message = "Instructor ID is required")
	private String instructorId;	
}
