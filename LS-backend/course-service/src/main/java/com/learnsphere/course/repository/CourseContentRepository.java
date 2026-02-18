package com.learnsphere.course.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.learnsphere.course.entity.CourseContent;

public interface CourseContentRepository extends MongoRepository<CourseContent,String>{
	List<CourseContent> findByCourseIdOrderByOrderIndexAsc(String courseId);
}
