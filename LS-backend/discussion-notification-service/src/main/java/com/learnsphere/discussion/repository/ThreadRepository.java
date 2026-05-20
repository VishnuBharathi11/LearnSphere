package com.learnsphere.discussion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.learnsphere.discussion.model.ThreadDocument;

public interface ThreadRepository extends MongoRepository<ThreadDocument, String> {
    Page<ThreadDocument> findByCourseIdAndIsArchivedFalse(String courseId, Pageable pageable);
}
