package com.learnsphere.progress.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnsphere.progress.entity.Quiz;
import com.learnsphere.progress.service.AssessmentService;
import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/progress/quizzes")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<Quiz> saveQuiz(@RequestBody Quiz request) {
        return ResponseEntity.ok(assessmentService.saveOrUpdateQuiz(request));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Quiz>> getAllByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(assessmentService.getQuizzesByCourseId(courseId));
    }

    @GetMapping("/course/{courseId}/latest")
    public ResponseEntity<Quiz> getByCourse(@PathVariable String courseId) {
        return assessmentService.getQuizByCourseId(courseId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
