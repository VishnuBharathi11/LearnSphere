package com.learnsphere.progress.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.learnsphere.progress.entity.Question;
import com.learnsphere.progress.entity.Quiz;
import com.learnsphere.progress.repository.QuizRepository;
import com.learnsphere.progress.service.AssessmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final QuizRepository quizRepository;

    @Override
    public Quiz saveOrUpdateQuiz(Quiz request) {
        if (request == null || isBlank(request.getCourseId())) {
            throw new IllegalArgumentException("Course id is required");
        }

        String courseId = request.getCourseId().trim();
        String assessmentType = isBlank(request.getAssessmentType()) ? "FINAL" : request.getAssessmentType().trim().toUpperCase();
        String lessonId = isBlank(request.getLessonId()) ? null : request.getLessonId().trim();

        if ("LESSON".equals(assessmentType) && isBlank(lessonId)) {
            throw new IllegalArgumentException("Lesson assessment must include lessonId");
        }

        Quiz existing = findScopedQuiz(courseId, assessmentType, lessonId).orElse(null);
        Instant now = Instant.now();

        Quiz target = existing == null ? new Quiz() : existing;
        target.setCourseId(courseId);
        target.setInstructorId(isBlank(request.getInstructorId()) ? "unknown" : request.getInstructorId().trim());
        target.setQuizTitle(isBlank(request.getQuizTitle()) ? "Course Assessment" : request.getQuizTitle().trim());
        target.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());
        target.setAssessmentType(assessmentType);
        target.setLessonId("LESSON".equals(assessmentType) ? lessonId : null);
        target.setLessonTitle(isBlank(request.getLessonTitle()) ? null : request.getLessonTitle().trim());
        target.setPassingScore(request.getPassingScore() == null ? 60 : request.getPassingScore());
        target.setTimeLimit(request.getTimeLimit() == null ? 20 : request.getTimeLimit());
        target.setQuestions(normalizeQuestions(request.getQuestions()));
        target.setUpdatedAt(now);
        if (target.getCreatedAt() == null) {
            target.setCreatedAt(now);
        }

        return quizRepository.save(target);
    }

    @Override
    public Optional<Quiz> getQuizByCourseId(String courseId) {
        if (isBlank(courseId)) {
            return Optional.empty();
        }
        List<Quiz> finals = quizRepository.findByCourseIdAndAssessmentTypeOrderByUpdatedAtDesc(courseId.trim(), "FINAL");
        if (finals.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(finals.get(0));
    }

    @Override
    public List<Quiz> getQuizzesByCourseId(String courseId) {
        if (isBlank(courseId)) {
            return List.of();
        }
        return quizRepository.findByCourseIdOrderByUpdatedAtDesc(courseId.trim());
    }

    private Optional<Quiz> findScopedQuiz(String courseId, String assessmentType, String lessonId) {
        if ("LESSON".equals(assessmentType)) {
            return quizRepository.findByCourseIdAndAssessmentTypeAndLessonId(courseId, "LESSON", lessonId);
        }
        List<Quiz> finals = quizRepository.findByCourseIdAndAssessmentTypeOrderByUpdatedAtDesc(courseId, "FINAL");
        return finals.stream()
            .filter(quiz -> isBlank(quiz.getLessonId()))
            .findFirst();
    }

    private List<Question> normalizeQuestions(List<Question> questions) {
        if (questions == null || questions.isEmpty()) {
            return new ArrayList<>();
        }

        List<Question> result = new ArrayList<>();
        for (Question question : questions) {
            if (question == null || isBlank(question.getQuestion())) continue;
            Question normalized = Question.builder()
                .id(question.getId())
                .question(question.getQuestion().trim())
                .points(question.getPoints() == null ? 1 : question.getPoints())
                .options(question.getOptions() == null ? new ArrayList<>() : question.getOptions())
                .build();
            result.add(normalized);
        }
        return result;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
