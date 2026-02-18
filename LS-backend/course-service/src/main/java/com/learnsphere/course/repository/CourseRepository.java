package com.learnsphere.course.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.learnsphere.course.entity.Course;
import com.learnsphere.course.entity.CourseStatus;

@Repository
public interface CourseRepository extends MongoRepository<Course,String>{
	Page<Course> findByStatus(CourseStatus status,Pageable pageable);
	Page<Course> findByCategoryId(String categoryId,Pageable pageable);
	Page<Course> findByInstructorId(String instructorId,Pageable pageable);
	Page<Course> findByTitleContainingIgnoreCase(String keyword,Pageable pageable);
	
}
