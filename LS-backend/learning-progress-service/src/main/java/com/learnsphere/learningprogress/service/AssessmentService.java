package com.learnsphere.learningprogress.service;

import com.learnsphere.learningprogress.entity.Quiz;
import com.learnsphere.learningprogress.entity.QuizAttempt;

import java.util.Map;

public interface AssessmentService {

    Quiz createQuiz(Quiz quiz);

    QuizAttempt attemptQuiz(String userId,
                            String quizId,
                            Map<String, String> answers);
}
