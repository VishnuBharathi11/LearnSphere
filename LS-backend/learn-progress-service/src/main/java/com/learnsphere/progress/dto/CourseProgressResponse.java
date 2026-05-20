package com.learnsphere.progress.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.learnsphere.progress.entity.AssessmentResult;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseProgressResponse {
    private String userId;
    private String courseId;
    private List<String> completedLessonIds;
    private Map<String, AssessmentResult> lessonAssessments;
    private AssessmentResult finalAssessment;
    private Instant updatedAt;
}
