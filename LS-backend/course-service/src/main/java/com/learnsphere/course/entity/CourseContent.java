package com.learnsphere.course.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Document(collation = "course_contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseContent {
	@Id
	private String id;
	private String courseId;
	private String title;
	private String type;
	private String fileUrl;
	private Integer orderIndex;
	private Instant uploadedAt;
}
