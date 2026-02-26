package com.learnsphere.progress.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;

    @Indexed
    private String courseId;

    @Indexed
    private String instructorId;

    private String quizTitle;
    private String description;
    private String assessmentType;
    private String lessonId;
    private String lessonTitle;
    private Integer passingScore;
    private Integer timeLimit;

    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;
}
