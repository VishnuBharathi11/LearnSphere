package com.learnsphere.course.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
				.thumbnail(request.getThumbnail())
				.price(request.getPrice())
                .categoryId(request.getCategoryId())
                .instructorId(request.getInstructorId())
                .build()
				);
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('INSTRUCTOR')")
	public Course update(@PathVariable String id, @Valid @RequestBody CourseRequest request) {
		return courseService.updateCourse(
				id,
				Course.builder()
						.title(request.getTitle())
						.description(request.getDescription())
						.thumbnail(request.getThumbnail())
						.price(request.getPrice())
						.categoryId(request.getCategoryId())
						.instructorId(request.getInstructorId())
						.build()
		);
	}
	
	@PostMapping("/{id}/submit")
	@PreAuthorize("hasRole('INSTRUCTOR')")
	public Course submit(@PathVariable String id) {
		return courseService.submitForReview(id);
	}

	@PostMapping("/{id}/publish")
	@PreAuthorize("hasRole('ADMIN')")
	public Course publish(@PathVariable String id) {
		return courseService.publishCourse(id);
	}

	@GetMapping("/instructor/{instructorId}")
	@PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
	public Page<Course> byInstructor(
			@PathVariable String instructorId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size
	) {
		return courseService.byInstructor(instructorId, page, size);
	}

	@GetMapping("/{id}")
	public Course getById(@PathVariable String id) {
		return courseService.getById(id);
	}

	@GetMapping("/published")
	public Page<Course> published(@RequestParam(defaultValue = "0") int page,@RequestParam(defaultValue = "10") int size){
		return courseService.getPublished(page, size);
	}

	@GetMapping("/admin/all")
	@PreAuthorize("hasRole('ADMIN')")
	public List<Course> adminAll(
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String search
	) {
		return courseService.adminList(status, search);
	}

	@PostMapping("/{id}/reject")
	@PreAuthorize("hasRole('ADMIN')")
	public Course reject(@PathVariable String id, @RequestParam(required = false) String note) {
		return courseService.rejectCourse(id, note);
	}

	@PostMapping("/{id}/archive")
	@PreAuthorize("hasRole('ADMIN')")
	public Course archive(@PathVariable String id) {
		return courseService.archiveCourse(id);
	}

	@PostMapping("/{id}/activate")
	@PreAuthorize("hasRole('ADMIN')")
	public Course activate(@PathVariable String id) {
		return courseService.activateCourse(id);
	}

	@DeleteMapping("/{id}/admin")
	@PreAuthorize("hasRole('ADMIN')")
	public void adminDelete(@PathVariable String id) {
		courseService.deleteCourse(id);
	}
}
