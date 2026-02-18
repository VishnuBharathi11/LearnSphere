package com.learnsphere.discussion.dto;

import lombok.Data;

@Data
public class DiscussionRequest {

    private Long courseId;
    private Long userId;
    private String message;
    private Long parentId;
}
