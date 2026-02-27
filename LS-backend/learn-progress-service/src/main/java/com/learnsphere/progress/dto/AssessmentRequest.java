package com.learnsphere.progress.dto;

import lombok.Data;

@Data
public class AssessmentRequest {
    private String userId;
    private String lessonId;
    private Integer score;
    private Integer total;
    private Boolean passed;
    private Integer passingScore;
}
