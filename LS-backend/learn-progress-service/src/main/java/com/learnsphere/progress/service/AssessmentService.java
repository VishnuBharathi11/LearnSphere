package com.learnsphere.progress.service;

import java.util.Optional;
import java.util.List;

import com.learnsphere.progress.entity.Quiz;

public interface AssessmentService {
    Quiz saveOrUpdateQuiz(Quiz request);

    Optional<Quiz> getQuizByCourseId(String courseId);

    List<Quiz> getQuizzesByCourseId(String courseId);
}
