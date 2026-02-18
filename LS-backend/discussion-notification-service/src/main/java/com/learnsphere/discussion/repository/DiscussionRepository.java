package com.learnsphere.discussion.repository;

import com.learnsphere.discussion.entity.DiscussionPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionRepository
        extends JpaRepository<DiscussionPost, Long> {

    List<DiscussionPost> findByCourseId(Long courseId);
}
