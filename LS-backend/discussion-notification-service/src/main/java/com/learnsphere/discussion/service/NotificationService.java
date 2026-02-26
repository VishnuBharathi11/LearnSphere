package com.learnsphere.discussion.service;

import java.util.List;

import com.learnsphere.discussion.dto.response.NotificationResponse;

public interface NotificationService {
    void createNotification(String userId, String title, String message);
    void createNotification(String userId, String title, String message, String courseId, String threadId);

    List<NotificationResponse> getUserNotifications(String userId);

    void markNotificationRead(String notificationId, String userId);
}
