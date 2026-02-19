package com.learnsphere.learningprogress.repository;

import com.learnsphere.learningprogress.entity.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface QuizAttemptRepository
        extends MongoRepository<QuizAttempt, String> {

    Optional<QuizAttempt>
    findTopByUserIdAndQuizIdOrderByAttemptedAtDesc(
            String userId,
            String quizId);
}
