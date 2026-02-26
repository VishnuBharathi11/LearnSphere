package com.learnsphere.discussion.dto.response;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String userId;
    private String title;
    private String message;
    private String courseId;
    private String threadId;
    private boolean read;
    private Instant createdAt;
}
