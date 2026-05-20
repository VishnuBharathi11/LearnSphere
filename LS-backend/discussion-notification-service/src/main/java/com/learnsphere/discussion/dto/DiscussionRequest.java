package com.learnsphere.discussion.dto;

import lombok.Data;

@Data
public class DiscussionRequest {
    private String courseId;
    private String userId;
    private String message;
    private String parentId;
}
