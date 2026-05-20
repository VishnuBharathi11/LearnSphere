package com.learnsphere.progress.dto;

import lombok.Data;

@Data
public class LessonProgressRequest {
    private String userId;
    private String lessonId;
}
