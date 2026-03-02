package com.learnsphere.progress.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.learnsphere.progress.entity.CourseProgress;

public interface CourseProgressRepository extends MongoRepository<CourseProgress, String> {
    Optional<CourseProgress> findTopByUserIdAndCourseIdOrderByUpdatedAtDesc(String userId, String courseId);
    List<CourseProgress> findByUserIdAndCourseIdOrderByUpdatedAtDesc(String userId, String courseId);
    List<CourseProgress> findByUserIdAndCourseIdIn(String userId, List<String> courseIds);
}
