package com.learnsphere.learningprogress.controller;

import com.learnsphere.learningprogress.entity.Quiz;
import com.learnsphere.learningprogress.entity.QuizAttempt;
import com.learnsphere.learningprogress.service.AssessmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    /**
     * Create Quiz (Instructor/Admin)
     */
    @PostMapping("/quiz")
    public ResponseEntity<Quiz> createQuiz(
            @RequestBody Quiz quiz) {

        Quiz savedQuiz =
                assessmentService.createQuiz(quiz);

        return ResponseEntity.ok(savedQuiz);
    }

    /**
     * Attempt Quiz (Student)
     */
    @PostMapping("/attempt/{quizId}")
    public ResponseEntity<QuizAttempt> attemptQuiz(
            @PathVariable String quizId,
            @RequestBody Map<String, String> answers) {

        String userId =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        QuizAttempt attempt =
                assessmentService.attemptQuiz(
                        userId,
                        quizId,
                        answers);

        return ResponseEntity.ok(attempt);
    }
}
