package com.learnsphere.progress.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.learnsphere.progress.dto.AssessmentRequest;
import com.learnsphere.progress.dto.CourseProgressResponse;
import com.learnsphere.progress.dto.LessonProgressRequest;
import com.learnsphere.progress.service.ProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/courses/{courseId}/users/{userId}")
    public ResponseEntity<CourseProgressResponse> getProgress(
            @PathVariable String courseId,
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(progressService.getProgress(userId, courseId));
    }

    @GetMapping("/users/{userId}/courses")
    public ResponseEntity<List<CourseProgressResponse>> getProgressByCourses(
            @PathVariable String userId,
            @RequestParam List<String> courseIds
    ) {
        return ResponseEntity.ok(progressService.getProgressByCourses(userId, courseIds));
    }

    @PostMapping("/courses/{courseId}/lessons/complete")
    public ResponseEntity<CourseProgressResponse> markLessonCompleted(
            @PathVariable String courseId,
            @RequestBody LessonProgressRequest request
    ) {
        return ResponseEntity.ok(progressService.markLessonCompleted(courseId, request));
    }

    @PostMapping("/courses/{courseId}/assessments/lesson")
    public ResponseEntity<CourseProgressResponse> saveLessonAssessment(
            @PathVariable String courseId,
            @RequestBody AssessmentRequest request
    ) {
        return ResponseEntity.ok(progressService.saveLessonAssessment(courseId, request));
    }

    @PostMapping("/courses/{courseId}/assessments/final")
    public ResponseEntity<CourseProgressResponse> saveFinalAssessment(
            @PathVariable String courseId,
            @RequestBody AssessmentRequest request
    ) {
        return ResponseEntity.ok(progressService.saveFinalAssessment(courseId, request));
    }
}
