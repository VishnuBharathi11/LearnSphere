package com.learnsphere.course.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.learnsphere.course.dto.CourseRequest;
import com.learnsphere.course.entity.Course;
import com.learnsphere.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
	private final CourseService courseService;
	
	@PostMapping
	@PreAuthorize("hasRole('INSTRUCTOR')")
	public Course create(@Valid @RequestBody CourseRequest request) {
		return courseService.createCourse(
				Course.builder()
				.title(request.getTitle())
				.description(request.getDescription())
				.price(request.getPrice())
                .categoryId(request.getCategoryId())
                .instructorId(request.getInstructorId())
                .build()
				);
	}
	
	@PostMapping("/{id}/submit")
	@PreAuthorize("hasRole('INSTRUCTOR')")
	public Course submit(@PathVariable String id) {
		return courseService.publishCourse(id);
	}
	@GetMapping("/published")
	public Page<Course> published(@RequestParam(defaultValue = "0") int page,@RequestParam(defaultValue = "10") int size){
		return courseService.getPublished(page, size);
	}
}
