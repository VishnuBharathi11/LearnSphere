package com.learnsphere.discussion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteResponse {
    private String id;
    private long upvoteCount;
    private boolean upvotedByCurrentUser;
}
