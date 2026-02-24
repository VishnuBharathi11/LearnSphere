package com.learnsphere.course.service.impl;

import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.learnsphere.course.entity.Course;
import com.learnsphere.course.entity.CourseStatus;
import com.learnsphere.course.exception.BadRequestException;
import com.learnsphere.course.exception.ResourseNotFoundException;
import com.learnsphere.course.repository.CategoryRepository;
import com.learnsphere.course.repository.CourseRepository;
import com.learnsphere.course.service.CourseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService{
	private final CourseRepository courseRepository;
	private final CategoryRepository categoryRepository;
	
//	public CourseServiceImpl(CourseRepository courseRepository,CategoryRepository categoryRepository) {
//		this.courseRepository=courseRepository;
//		this.categoryRepository=categoryRepository;
//	}
	private Course getCourse(String id) {
		return courseRepository.findById(id)
				.orElseThrow(()->new ResourseNotFoundException("Course not found:"+id));
	}
	@Override
	public Course createCourse(Course course) {
		 if (!categoryRepository.existsById(course.getCategoryId())) {
		        throw new BadRequestException("Invalid category");
		    }
		course.setStatus(CourseStatus.DRAFT);
		course.setCreatedAt(Instant.now());
		return courseRepository.save(course);
	}

	@Override
	public Course updateCourse(String id, Course request) {
		Course course = getCourse(id);
		if (!categoryRepository.existsById(request.getCategoryId())) {
			throw new BadRequestException("Invalid category");
		}
		if (request.getInstructorId() == null || !request.getInstructorId().equals(course.getInstructorId())) {
			throw new BadRequestException("Instructor mismatch");
		}
		course.setTitle(request.getTitle());
		course.setDescription(request.getDescription());
		course.setThumbnail(request.getThumbnail());
		course.setPrice(request.getPrice());
		course.setCategoryId(request.getCategoryId());
		return courseRepository.save(course);
	}
	
	@Override
	public Course getById(String id) {
		return getCourse(id);
	}

	@Override
	public void deleteCourse(String id) {
		if(!courseRepository.existsById(id)) {
			throw new ResourseNotFoundException("Course not found with id:"+id);
		}
		courseRepository.deleteById(id);
	}
	@Override
	public Course submitForReview(String id) {
		Course course=getCourse(id);
		if(course.getStatus()!=CourseStatus.DRAFT)
			throw new BadRequestException("Only draft allowed");
		course.setStatus(CourseStatus.REVIEW);
		return courseRepository.save(course);
	}
	@Override
	public Course publishCourse(String id) {
		Course course=getCourse(id);
		if(course.getStatus()!=CourseStatus.REVIEW)
			throw new BadRequestException("Only review allowed");
		course.setStatus(CourseStatus.PUBLISHED);
		return courseRepository.save(course);
	}
	@Override
	public Course archiveCourse(String id) {
		Course course=getCourse(id);
		
		course.setStatus(CourseStatus.REVIEW);
		return courseRepository.save(course);
	}
	@Override
	public Page<Course> getPublished(int page, int size) {
		return courseRepository.findByStatus(CourseStatus.PUBLISHED, PageRequest.of(page, size,Sort.by("createdAt").descending()));
	}
	@Override
	public Page<Course> search(String keyword, int page, int size) {
		return courseRepository.findByTitleContainingIgnoreCase(keyword, PageRequest.of(page, size));
	}
	@Override
	public Page<Course> byCategory(String categoryId, int page, int size) {
		return courseRepository.findByCategoryId(categoryId, PageRequest.of(page, size));
	}
	@Override
	public Page<Course> byInstructor(String instructorId, int page, int size) {
		return courseRepository.findByInstructorId(instructorId, PageRequest.of(page, size));
	}
}
