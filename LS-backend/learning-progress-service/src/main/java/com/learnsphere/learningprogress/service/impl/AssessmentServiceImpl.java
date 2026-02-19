package com.learnsphere.learningprogress.service.impl;

import com.learnsphere.learningprogress.entity.Question;
import com.learnsphere.learningprogress.entity.Quiz;
import com.learnsphere.learningprogress.entity.QuizAttempt;
import com.learnsphere.learningprogress.repository.QuizAttemptRepository;
import com.learnsphere.learningprogress.repository.QuizRepository;
import com.learnsphere.learningprogress.service.AssessmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;

    @Override
    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    @Override
    public QuizAttempt attemptQuiz(String userId,
                                   String quizId,
                                   Map<String, String> answers) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        int score = 0;

        for (Question q : quiz.getQuestions()) {

            String selected =
                    answers.get(q.getQuestionId());

            if (q.getCorrectAnswer()
                    .equalsIgnoreCase(selected)) {
                score++;
            }
        }

        String status =
                score >= quiz.getPassMarks()
                        ? "PASS"
                        : "FAIL";

        QuizAttempt attempt = QuizAttempt.builder()
                .userId(userId)
                .quizId(quizId)
                .answers(answers)
                .score(score)
                .status(status)
                .attemptedAt(LocalDateTime.now())
                .build();

        return attemptRepository.save(attempt);
    }
}
