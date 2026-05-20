package com.learnsphere.discussion.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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
@Document(collection = "threads")
public class ThreadDocument {
    @Id
    private String id;

    @Indexed
    private String courseId;

    private String title;
    private String content;

    @Indexed
    private String authorId;

    private String authorName;
    private ForumRole authorRole;

    @Builder.Default
    private List<String> upvotes = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @Builder.Default
    private boolean isLocked = false;

    @Builder.Default
    private boolean isArchived = false;

    @Builder.Default
    private long replyCount = 0;
}
