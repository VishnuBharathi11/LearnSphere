package com.learnsphere.discussion.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.learnsphere.discussion.model.ReplyDocument;

public interface ReplyRepository extends MongoRepository<ReplyDocument, String> {
    Page<ReplyDocument> findByThreadIdAndParentReplyIdIsNullAndIsDeletedFalse(String threadId, Pageable pageable);

    List<ReplyDocument> findByThreadIdAndIsDeletedFalse(String threadId);

    long countByThreadIdAndIsDeletedFalse(String threadId);

    void deleteByThreadId(String threadId);
}
