package com.learnsphere.course.dto;

import lombok.Data;

import java.util.List;

@Data
public class LessonRequest {
    private String title;
    private String heading;
    private List<String> subheadings;
    private String description;
    private String type;
    private String fileUrl;
    private String fileName;
    private String mimeType;
    private Integer orderIndex;
}
