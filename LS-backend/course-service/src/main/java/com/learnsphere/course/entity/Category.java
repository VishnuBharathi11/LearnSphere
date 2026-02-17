package com.learnsphere.course.entity;

import lombok.*;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection="categories")
public class Category {
	@Id
	private String id;
	private String name;
	private String description;
	private boolean active;
	private Instant createdAt;
}

