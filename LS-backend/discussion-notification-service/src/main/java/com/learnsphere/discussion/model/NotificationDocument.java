package com.learnsphere.discussion.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class NotificationDocument {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String message;
    private String courseId;
    private String threadId;

    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    private Instant createdAt;
}
