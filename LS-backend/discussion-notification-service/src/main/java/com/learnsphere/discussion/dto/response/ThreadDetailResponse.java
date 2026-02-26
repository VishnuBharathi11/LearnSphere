package com.learnsphere.discussion.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreadDetailResponse {
    private ThreadSummaryResponse thread;
    private List<ReplyNodeResponse> replies;
    private int page;
    private int size;
    private long totalTopLevelReplies;
    private int totalPages;
}
