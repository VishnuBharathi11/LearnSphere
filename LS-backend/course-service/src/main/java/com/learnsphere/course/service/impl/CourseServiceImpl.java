package com.learnsphere.course.service.impl;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
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
		course.setUpdatedAt(Instant.now());
		course.setModerationNote(null);
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
		course.setUpdatedAt(Instant.now());
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
		course.setModerationNote("SUBMITTED_FOR_REVIEW");
		course.setUpdatedAt(Instant.now());
		return courseRepository.save(course);
	}
	@Override
	public Course publishCourse(String id) {
		Course course=getCourse(id);
		if(course.getStatus()!=CourseStatus.REVIEW)
			throw new BadRequestException("Only review allowed");
		course.setStatus(CourseStatus.PUBLISHED);
		course.setModerationNote("APPROVED");
		course.setUpdatedAt(Instant.now());
		return courseRepository.save(course);
	}
	@Override
	public Course archiveCourse(String id) {
		Course course=getCourse(id);
		course.setStatus(CourseStatus.ARCHIVED);
		course.setModerationNote("SUSPENDED");
		course.setUpdatedAt(Instant.now());
		return courseRepository.save(course);
	}
	@Override
	public Course rejectCourse(String id, String note) {
		Course course = getCourse(id);
		course.setStatus(CourseStatus.ARCHIVED);
		course.setModerationNote(note == null || note.isBlank() ? "REJECTED" : note.trim());
		course.setUpdatedAt(Instant.now());
		return courseRepository.save(course);
	}

	@Override
	public Course activateCourse(String id) {
		Course course = getCourse(id);
		course.setStatus(CourseStatus.PUBLISHED);
		course.setModerationNote("ACTIVE");
		course.setUpdatedAt(Instant.now());
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

	@Override
	public List<Course> adminList(String status, String search) {
		String safeStatus = status == null ? "" : status.trim().toUpperCase();
		String safeSearch = search == null ? "" : search.trim().toLowerCase();

		return courseRepository.findAll().stream()
				.filter(course -> {
					if (safeStatus.isBlank()) return true;
					if ("PENDING".equals(safeStatus)) return course.getStatus() == CourseStatus.REVIEW;
					return course.getStatus() != null && course.getStatus().name().equals(safeStatus);
				})
				.filter(course -> {
					if (safeSearch.isBlank()) return true;
					String title = course.getTitle() == null ? "" : course.getTitle().toLowerCase();
					String instructorId = course.getInstructorId() == null ? "" : course.getInstructorId().toLowerCase();
					return title.contains(safeSearch) || instructorId.contains(safeSearch);
				})
				.sorted(Comparator.comparing(Course::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
				.toList();
	}
}
