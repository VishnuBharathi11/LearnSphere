package com.learnsphere.discussion.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.learnsphere.discussion.dto.response.NotificationResponse;
import com.learnsphere.discussion.model.NotificationDocument;
import com.learnsphere.discussion.repository.NotificationRepository;
import com.learnsphere.discussion.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(String userId, String title, String message) {
        createNotification(userId, title, message, null, null);
    }

    @Override
    public void createNotification(String userId, String title, String message, String courseId, String threadId) {
        NotificationDocument notification = NotificationDocument.builder()
            .userId(userId)
            .title(title)
            .message(message)
            .courseId(courseId)
            .threadId(threadId)
            .isRead(false)
            .createdAt(Instant.now())
            .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(item -> NotificationResponse.builder()
                .id(item.getId())
                .userId(item.getUserId())
                .title(item.getTitle())
                .message(item.getMessage())
                .courseId(item.getCourseId())
                .threadId(item.getThreadId())
                .read(item.isRead())
                .createdAt(item.getCreatedAt())
                .build())
            .toList();
    }

    @Override
    public void markNotificationRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(item -> {
            if (!Objects.equals(item.getUserId(), userId)) {
                return;
            }
            if (item.isRead()) {
                return;
            }
            item.setRead(true);
            notificationRepository.save(item);
        });
    }
}
