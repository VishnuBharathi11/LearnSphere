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
public class PagedThreadsResponse {
    private List<ThreadSummaryResponse> items;
    private int page;
    private int size;
    private long totalItems;
    private int totalPages;
}
