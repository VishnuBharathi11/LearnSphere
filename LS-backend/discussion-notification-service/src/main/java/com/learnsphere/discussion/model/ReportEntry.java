package com.learnsphere.discussion.model;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportEntry {
    private String userId;
    private String reason;
    private Instant createdAt;
}
