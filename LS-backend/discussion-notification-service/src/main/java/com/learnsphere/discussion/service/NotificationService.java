package com.learnsphere.discussion.service;

import java.util.List;

import com.learnsphere.discussion.dto.response.NotificationResponse;

public interface NotificationService {
    void createNotification(String userId, String title, String message);

    List<NotificationResponse> getUserNotifications(String userId);
}
