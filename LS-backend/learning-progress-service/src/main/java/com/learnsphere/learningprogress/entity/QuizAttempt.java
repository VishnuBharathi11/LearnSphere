package com.learnsphere.learningprogress.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quiz_attempt")
public class QuizAttempt {

    @Id
    private String id;

    private String userId;
    private String quizId;

    private Map<String, String> answers;

    private int score;
    private String status;

    private LocalDateTime attemptedAt;
}
