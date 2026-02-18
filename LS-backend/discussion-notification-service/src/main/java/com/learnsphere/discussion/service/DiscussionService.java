package com.learnsphere.discussion.service;

import com.learnsphere.discussion.dto.DiscussionRequest;
import com.learnsphere.discussion.entity.DiscussionPost;

import java.util.List;

public interface DiscussionService {

    DiscussionPost createPost(DiscussionRequest request);

    List<DiscussionPost> getCoursePosts(Long courseId);
}
