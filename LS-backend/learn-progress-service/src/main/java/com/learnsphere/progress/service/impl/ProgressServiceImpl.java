package com.learnsphere.progress.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.learnsphere.progress.dto.AssessmentRequest;
import com.learnsphere.progress.dto.CourseProgressResponse;
import com.learnsphere.progress.dto.LessonProgressRequest;
import com.learnsphere.progress.entity.AssessmentResult;
import com.learnsphere.progress.entity.CourseProgress;
import com.learnsphere.progress.repository.CourseProgressRepository;
import com.learnsphere.progress.service.ProgressService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final CourseProgressRepository courseProgressRepository;

    @Override
    public CourseProgressResponse getProgress(String userId, String courseId) {
        CourseProgress progress = courseProgressRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> createEmptyProgress(userId, courseId));
        return toResponse(progress);
    }

    @Override
    public List<CourseProgressResponse> getProgressByCourses(String userId, List<String> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) return List.of();

        List<CourseProgress> progressList = courseProgressRepository.findByUserIdAndCourseIdIn(userId, courseIds);
        Map<String, CourseProgress> byCourse = new HashMap<>();
        progressList.forEach(item -> byCourse.put(item.getCourseId(), item));

        List<CourseProgressResponse> responses = new ArrayList<>();
        for (String courseId : courseIds) {
            CourseProgress progress = byCourse.getOrDefault(courseId, createEmptyProgress(userId, courseId));
            responses.add(toResponse(progress));
        }
        return responses;
    }

    @Override
    public CourseProgressResponse markLessonCompleted(String courseId, LessonProgressRequest request) {
        CourseProgress progress = getOrCreate(request.getUserId(), courseId);
        List<String> completed = new ArrayList<>(Optional.ofNullable(progress.getCompletedLessonIds()).orElse(List.of()));
        String lessonId = String.valueOf(request.getLessonId());
        if (!completed.contains(lessonId)) {
            completed.add(lessonId);
        }
        progress.setCompletedLessonIds(completed);
        progress.setUpdatedAt(Instant.now());
        CourseProgress saved = courseProgressRepository.save(progress);
        return toResponse(saved);
    }

    @Override
    public CourseProgressResponse saveLessonAssessment(String courseId, AssessmentRequest request) {
        CourseProgress progress = getOrCreate(request.getUserId(), courseId);
        Map<String, AssessmentResult> lessonAssessments = new HashMap<>(
                Optional.ofNullable(progress.getLessonAssessments()).orElse(Map.of())
        );
        String lessonId = String.valueOf(request.getLessonId());
        lessonAssessments.put(lessonId, AssessmentResult.builder()
                .score(request.getScore())
                .total(request.getTotal())
                .passed(Boolean.TRUE.equals(request.getPassed()))
                .passingScore(request.getPassingScore())
                .submittedAt(Instant.now())
                .build());
        progress.setLessonAssessments(lessonAssessments);
        progress.setUpdatedAt(Instant.now());
        CourseProgress saved = courseProgressRepository.save(progress);
        return toResponse(saved);
    }

    @Override
    public CourseProgressResponse saveFinalAssessment(String courseId, AssessmentRequest request) {
        CourseProgress progress = getOrCreate(request.getUserId(), courseId);
        progress.setFinalAssessment(AssessmentResult.builder()
                .score(request.getScore())
                .total(request.getTotal())
                .passed(Boolean.TRUE.equals(request.getPassed()))
                .passingScore(request.getPassingScore())
                .submittedAt(Instant.now())
                .build());
        progress.setUpdatedAt(Instant.now());
        CourseProgress saved = courseProgressRepository.save(progress);
        return toResponse(saved);
    }

    private CourseProgress getOrCreate(String userId, String courseId) {
        return courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> createEmptyProgress(userId, courseId));
    }

    private CourseProgress createEmptyProgress(String userId, String courseId) {
        CourseProgress progress = CourseProgress.builder()
                .userId(userId)
                .courseId(courseId)
                .completedLessonIds(new ArrayList<>())
                .lessonAssessments(new HashMap<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return courseProgressRepository.save(progress);
    }

    private CourseProgressResponse toResponse(CourseProgress progress) {
        return CourseProgressResponse.builder()
                .userId(progress.getUserId())
                .courseId(progress.getCourseId())
                .completedLessonIds(progress.getCompletedLessonIds())
                .lessonAssessments(progress.getLessonAssessments())
                .finalAssessment(progress.getFinalAssessment())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
