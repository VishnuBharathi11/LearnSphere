package com.learnsphere.discussion.service.impl;

import com.learnsphere.discussion.dto.NotificationRequest;
import com.learnsphere.discussion.entity.Notification;
import com.learnsphere.discussion.repository.NotificationRepository;
import com.learnsphere.discussion.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;

    @Override
    public Notification createNotification(NotificationRequest request) {

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .isRead(false)
                .build();

        return repository.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return repository.findByUserId(userId);
    }
}
