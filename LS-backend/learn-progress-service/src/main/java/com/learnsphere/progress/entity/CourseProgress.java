package com.learnsphere.progress.entity;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "course_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgress {
    @Id
    private String id;
    private String userId;
    private String courseId;
    @Builder.Default
    private List<String> completedLessonIds = List.of();
    @Builder.Default
    private Map<String, AssessmentResult> lessonAssessments = Map.of();
    private AssessmentResult finalAssessment;
    private Instant createdAt;
    private Instant updatedAt;
}
