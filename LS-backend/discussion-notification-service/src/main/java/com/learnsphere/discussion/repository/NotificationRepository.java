package com.learnsphere.discussion.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.learnsphere.discussion.model.NotificationDocument;

public interface NotificationRepository extends MongoRepository<NotificationDocument, String> {
    List<NotificationDocument> findByUserIdOrderByCreatedAtDesc(String userId);
}
