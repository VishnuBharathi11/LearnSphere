package com.learnsphere.course.entity;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Document(collection = "course_contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseContent {
	@Id
	private String id;
	private String courseId;
	private String title;
	private String heading;
	private List<String> subheadings;
	private String description;
	private String type;
	private String fileUrl;
	private String fileName;
	private String mimeType;
	private Integer orderIndex;
	private Instant uploadedAt;
}
