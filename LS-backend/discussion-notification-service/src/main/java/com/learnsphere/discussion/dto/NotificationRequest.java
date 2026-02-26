package com.learnsphere.discussion.dto;

import lombok.Data;

@Data
public class NotificationRequest {
    private String userId;
    private String title;
    private String message;
}
