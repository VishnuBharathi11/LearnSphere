package com.learnsphere.learningprogress.repository;

import com.learnsphere.learningprogress.entity.VideoProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface VideoProgressRepository
        extends MongoRepository<VideoProgress, String> {

    Optional<VideoProgress> findByUserIdAndLessonId(
            String userId,
            String lessonId);

    Optional<VideoProgress>
    findTopByUserIdAndCourseIdOrderByLastWatchedDesc(
            String userId,
            String courseId);

    List<VideoProgress> findByUserIdAndCourseId(
            String userId,
            String courseId);
}
