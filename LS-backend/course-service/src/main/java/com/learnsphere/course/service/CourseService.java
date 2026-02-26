package com.learnsphere.course.service;

import java.util.List;
import org.springframework.data.domain.Page;

import com.learnsphere.course.entity.Course;

public interface CourseService {
	Course createCourse(Course course);
	Course updateCourse(String id, Course course);
	Course getById(String id);
	Course submitForReview(String id);
	Course publishCourse(String id);
	Course archiveCourse(String id);
	Page<Course> getPublished(int page,int size);
	Page<Course> search(String keyword,int page,int size);
	Page<Course> byCategory(String categoryId,int page,int size);
	Page<Course> byInstructor(String instructorId,int page,int size);
	List<Course> adminList(String status, String search);
	Course rejectCourse(String id, String note);
	Course activateCourse(String id);
	void deleteCourse(String id);
}
