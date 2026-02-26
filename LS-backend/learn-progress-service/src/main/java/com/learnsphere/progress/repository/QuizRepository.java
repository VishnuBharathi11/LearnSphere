package com.learnsphere.progress.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.learnsphere.progress.entity.Quiz;

public interface QuizRepository extends MongoRepository<Quiz, String> {
    Optional<Quiz> findByCourseId(String courseId);
    Optional<Quiz> findByCourseIdAndAssessmentTypeAndLessonId(String courseId, String assessmentType, String lessonId);
    List<Quiz> findByCourseIdOrderByUpdatedAtDesc(String courseId);
}
