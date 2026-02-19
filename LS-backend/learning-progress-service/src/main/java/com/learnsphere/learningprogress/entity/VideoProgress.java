package com.learnsphere.learningprogress.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "video_progress")
public class VideoProgress {

    @Id
    private String id;

    private String userId;
    private String courseId;
    private String lessonId;

    private int watchedSeconds;
    private int totalSeconds;
    private double progressPercent;

    private LocalDateTime lastWatched;
}
