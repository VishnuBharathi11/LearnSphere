package com.learnsphere.enrollment.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnsphere.enrollment.entity.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment,Long>{
	Optional<Enrollment> findByUserIdAndCourseId(String userId,String courseId);
}
