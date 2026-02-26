package com.learnsphere.admin.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseMetricResponse {
    private String courseId;
    private long learners;
    private double grossRevenue;
    private double platformRevenue;
}

