package com.learnsphere.enrollment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnsphere.enrollment.entity.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment,Long>{
	Optional<Enrollment> findByUserIdAndCourseId(String userId,String courseId);
	List<Enrollment> findByCourseId(String courseId);
	List<Enrollment> findByCourseIdIn(List<String> courseIds);
}
