package com.learnsphere.course.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Comparator;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.learnsphere.course.dto.CourseRequest;
import com.learnsphere.course.dto.LessonRequest;
import com.learnsphere.course.dto.LessonResponse;
import com.learnsphere.course.entity.Course;
import com.learnsphere.course.entity.CourseContent;
import com.learnsphere.course.service.CourseService;
import com.learnsphere.course.repository.CourseContentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
	private final CourseService courseService;
	private final CourseContentRepository courseContentRepository;
	
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

	@GetMapping("/{id}/lessons")
	@PreAuthorize("isAuthenticated()")
	public List<LessonResponse> listLessons(@PathVariable String id) {
		return courseContentRepository.findByCourseIdOrderByOrderIndexAsc(id)
				.stream()
				.sorted(Comparator.comparing(CourseContent::getOrderIndex, Comparator.nullsLast(Comparator.naturalOrder())))
				.map(this::toLessonResponse)
				.toList();
	}

	@PostMapping("/{id}/lessons")
	@PreAuthorize("hasRole('INSTRUCTOR')")
	public LessonResponse addLesson(@PathVariable String id, @RequestBody LessonRequest request) {
		CourseContent content = CourseContent.builder()
				.courseId(id)
				.title(request.getTitle())
				.heading(request.getHeading())
				.subheadings(request.getSubheadings())
				.description(request.getDescription())
				.type(request.getType())
				.fileUrl(request.getFileUrl())
				.fileName(request.getFileName())
				.mimeType(request.getMimeType())
				.orderIndex(request.getOrderIndex())
				.uploadedAt(Instant.now())
				.build();
		return toLessonResponse(courseContentRepository.save(content));
	}

	@PutMapping("/{courseId}/lessons/{lessonId}")
	@PreAuthorize("hasRole('INSTRUCTOR')")
	public LessonResponse updateLesson(
			@PathVariable String courseId,
			@PathVariable String lessonId,
			@RequestBody LessonRequest request
	) {
		CourseContent content = courseContentRepository.findById(lessonId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
		if (!courseId.equals(content.getCourseId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson does not belong to course");
		}
		content.setTitle(request.getTitle());
		content.setHeading(request.getHeading());
		content.setSubheadings(request.getSubheadings());
		content.setDescription(request.getDescription());
		content.setType(request.getType());
		content.setFileUrl(request.getFileUrl());
		content.setFileName(request.getFileName());
		content.setMimeType(request.getMimeType());
		content.setOrderIndex(request.getOrderIndex());
		return toLessonResponse(courseContentRepository.save(content));
	}

	@DeleteMapping("/{courseId}/lessons/{lessonId}")
	@PreAuthorize("hasRole('INSTRUCTOR')")
	public void deleteLesson(@PathVariable String courseId, @PathVariable String lessonId) {
		CourseContent content = courseContentRepository.findById(lessonId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
		if (!courseId.equals(content.getCourseId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson does not belong to course");
		}
		courseContentRepository.deleteById(lessonId);
	}

	private LessonResponse toLessonResponse(CourseContent content) {
		return LessonResponse.builder()
				.id(content.getId())
				.courseId(content.getCourseId())
				.title(content.getTitle())
				.heading(content.getHeading())
				.subheadings(content.getSubheadings())
				.description(content.getDescription())
				.type(content.getType())
				.fileUrl(content.getFileUrl())
				.fileName(content.getFileName())
				.mimeType(content.getMimeType())
				.orderIndex(content.getOrderIndex())
				.uploadedAt(content.getUploadedAt())
				.build();
	}
}
