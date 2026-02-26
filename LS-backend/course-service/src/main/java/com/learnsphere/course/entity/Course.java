package com.learnsphere.course.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection="courses")
public class Course {
	@Id
	private String id;
	private String title;
	private String description;
	private String thumbnail;
	private Double price;
	private String categoryId;
	private String instructorId;
	private CourseStatus status;
	private Instant createdAt;  
	private Instant updatedAt;
	private String moderationNote;
}
