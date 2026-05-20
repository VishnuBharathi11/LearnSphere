package com.learnsphere.progress.entity;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResult {
    private Integer score;
    private Integer total;
    private Boolean passed;
    private Integer passingScore;
    private Instant submittedAt;
}
