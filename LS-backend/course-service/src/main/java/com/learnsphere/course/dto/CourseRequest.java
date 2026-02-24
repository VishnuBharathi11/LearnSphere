package com.learnsphere.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {
	@NotBlank(message="Title is required")
	private String title;
	@NotBlank(message="Description is required")
	private String description;
	@NotBlank(message="Thumbnail is required")
	private String thumbnail;
	@NotNull(message="Price is required")
	@Min(0)
	private double price;
	@NotBlank(message = "Category ID is required")
	private String categoryId;
	@NotBlank(message = "Instructor ID is required")
	private String instructorId;	
}
