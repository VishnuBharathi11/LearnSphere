package com.learnsphere.enrollment.entity;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.*;
import com.learnsphere.enrollment.enums.EnrollmentStatus;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false)
	private String userId;
	@Column(nullable = false)
	private String courseId;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private EnrollmentStatus status;
	@Column(nullable = false)
	private Instant enrolledAt;
	
}
