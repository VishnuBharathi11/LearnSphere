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
public class ThreadSummaryResponse {
    private String id;
    private String courseId;
    private String title;
    private String content;
    private String authorId;
    private String authorName;
    private String authorRole;
    private long upvoteCount;
    private long replyCount;
    private Instant createdAt;
    private boolean locked;
    private boolean archived;
    private boolean upvotedByCurrentUser;
}
