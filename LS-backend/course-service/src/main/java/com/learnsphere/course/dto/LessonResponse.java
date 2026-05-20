package com.learnsphere.course.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class LessonResponse {
    private String id;
    private String courseId;
    private String title;
    private String heading;
    private List<String> subheadings;
    private String description;
    private String type;
    private String fileUrl;
    private String fileName;
    private String mimeType;
    private Integer orderIndex;
    private Instant uploadedAt;
}
