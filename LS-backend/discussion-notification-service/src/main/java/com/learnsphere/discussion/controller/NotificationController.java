package com.learnsphere.discussion.controller;

import com.learnsphere.discussion.dto.NotificationRequest;
import com.learnsphere.discussion.entity.Notification;
import com.learnsphere.discussion.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @PostMapping
    public Notification create(@RequestBody NotificationRequest request) {
        return service.createNotification(request);
    }

    @GetMapping("/{userId}")
    public List<Notification> get(@PathVariable Long userId) {
        return service.getUserNotifications(userId);
    }
}
