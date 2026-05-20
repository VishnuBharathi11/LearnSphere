package com.learnsphere.progress.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

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
    private final MongoTemplate mongoTemplate;

    @Override
    public CourseProgressResponse getProgress(String userId, String courseId) {
        CourseProgress progress = getLatestOrNull(userId, courseId);
        if (progress == null) {
            progress = createEmptyProgress(userId, courseId, false);
        }
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
            CourseProgress progress = byCourse.get(courseId);
            if (progress == null) {
                progress = createEmptyProgress(userId, courseId, false);
            }
            responses.add(toResponse(progress));
        }
        return responses;
    }

    @Override
    public CourseProgressResponse markLessonCompleted(String courseId, LessonProgressRequest request) {
        Instant now = Instant.now();
        Query query = userCourseQuery(request.getUserId(), courseId);
        Update update = new Update()
                .set("updatedAt", now)
                .setOnInsert("userId", request.getUserId())
                .setOnInsert("courseId", courseId)
                .setOnInsert("createdAt", now)
                .addToSet("completedLessonIds", String.valueOf(request.getLessonId()));

        CourseProgress saved = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().upsert(true).returnNew(true),
                CourseProgress.class
        );
        return toResponse(saved);
    }

    @Override
    public CourseProgressResponse saveLessonAssessment(String courseId, AssessmentRequest request) {
        Instant now = Instant.now();
        String lessonId = String.valueOf(request.getLessonId());
        AssessmentResult assessmentResult = AssessmentResult.builder()
                .score(request.getScore())
                .total(request.getTotal())
                .passed(Boolean.TRUE.equals(request.getPassed()))
                .passingScore(request.getPassingScore())
                .submittedAt(now)
                .build();

        Query query = userCourseQuery(request.getUserId(), courseId);
        Update update = new Update()
                .set("updatedAt", now)
                .setOnInsert("userId", request.getUserId())
                .setOnInsert("courseId", courseId)
                .setOnInsert("createdAt", now)
                .set("lessonAssessments." + lessonId, assessmentResult);

        CourseProgress saved = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().upsert(true).returnNew(true),
                CourseProgress.class
        );
        return toResponse(saved);
    }

    @Override
    public CourseProgressResponse saveFinalAssessment(String courseId, AssessmentRequest request) {
        Instant now = Instant.now();
        AssessmentResult assessmentResult = AssessmentResult.builder()
                .score(request.getScore())
                .total(request.getTotal())
                .passed(Boolean.TRUE.equals(request.getPassed()))
                .passingScore(request.getPassingScore())
                .submittedAt(now)
                .build();

        Query query = userCourseQuery(request.getUserId(), courseId);
        Update update = new Update()
                .set("updatedAt", now)
                .setOnInsert("userId", request.getUserId())
                .setOnInsert("courseId", courseId)
                .setOnInsert("createdAt", now)
                .set("finalAssessment", assessmentResult);

        CourseProgress saved = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().upsert(true).returnNew(true),
                CourseProgress.class
        );
        return toResponse(saved);
    }

    private Query userCourseQuery(String userId, String courseId) {
        return new Query(Criteria.where("userId").is(userId).and("courseId").is(courseId));
    }

    private CourseProgress getLatestOrNull(String userId, String courseId) {
        List<CourseProgress> duplicates = courseProgressRepository
                .findByUserIdAndCourseIdOrderByUpdatedAtDesc(userId, courseId);
        if (duplicates == null || duplicates.isEmpty()) {
            return null;
        }
        CourseProgress latest = duplicates.get(0);
        if (duplicates.size() > 1) {
            // Keep newest record and remove stale duplicates that cause read failures.
            List<CourseProgress> stale = duplicates.subList(1, duplicates.size());
            courseProgressRepository.deleteAll(stale);
        }
        return latest;
    }

    private CourseProgress createEmptyProgress(String userId, String courseId, boolean persist) {
        CourseProgress progress = CourseProgress.builder()
                .userId(userId)
                .courseId(courseId)
                .completedLessonIds(new ArrayList<>())
                .lessonAssessments(new HashMap<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return persist ? courseProgressRepository.save(progress) : progress;
    }

    private CourseProgressResponse toResponse(CourseProgress progress) {
        return CourseProgressResponse.builder()
                .userId(progress.getUserId())
                .courseId(progress.getCourseId())
                .completedLessonIds(Optional.ofNullable(progress.getCompletedLessonIds()).orElse(List.of()))
                .lessonAssessments(Optional.ofNullable(progress.getLessonAssessments()).orElse(Map.of()))
                .finalAssessment(progress.getFinalAssessment())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
