package com.learnsphere.discussion.dto.response;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyNodeResponse {
    private String id;
    private String threadId;
    private String parentReplyId;
    private String content;
    private String authorId;
    private String authorName;
    private String authorRole;
    private Instant createdAt;
    private long upvoteCount;
    private boolean upvotedByCurrentUser;
    private long reportCount;

    @Builder.Default
    private List<ReplyNodeResponse> children = new ArrayList<>();
}
