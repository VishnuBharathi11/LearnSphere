package com.learnsphere.discussion.service;

import com.learnsphere.discussion.dto.NotificationRequest;
import com.learnsphere.discussion.entity.Notification;

import java.util.List;

public interface NotificationService {

    Notification createNotification(NotificationRequest request);

    List<Notification> getUserNotifications(Long userId);
}
