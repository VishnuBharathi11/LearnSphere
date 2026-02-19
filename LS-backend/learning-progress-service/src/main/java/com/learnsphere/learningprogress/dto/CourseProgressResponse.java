package com.learnsphere.learningprogress.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseProgressResponse {

    private String courseId;
    private double completionPercentage;
    private String status;
}
