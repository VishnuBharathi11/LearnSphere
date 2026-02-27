package com.learnsphere.progress.service;

import java.util.List;

import com.learnsphere.progress.dto.AssessmentRequest;
import com.learnsphere.progress.dto.CourseProgressResponse;
import com.learnsphere.progress.dto.LessonProgressRequest;

public interface ProgressService {
    CourseProgressResponse getProgress(String userId, String courseId);
    List<CourseProgressResponse> getProgressByCourses(String userId, List<String> courseIds);
    CourseProgressResponse markLessonCompleted(String courseId, LessonProgressRequest request);
    CourseProgressResponse saveLessonAssessment(String courseId, AssessmentRequest request);
    CourseProgressResponse saveFinalAssessment(String courseId, AssessmentRequest request);
}
