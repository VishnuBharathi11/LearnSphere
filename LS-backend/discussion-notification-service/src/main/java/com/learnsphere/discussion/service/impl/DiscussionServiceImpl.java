package com.learnsphere.discussion.service.impl;

import com.learnsphere.discussion.dto.DiscussionRequest;
import com.learnsphere.discussion.entity.DiscussionPost;
import com.learnsphere.discussion.repository.DiscussionRepository;
import com.learnsphere.discussion.service.DiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscussionServiceImpl implements DiscussionService {

    private final DiscussionRepository repository;

    @Override
    public DiscussionPost createPost(DiscussionRequest request) {

        DiscussionPost post = DiscussionPost.builder()
                .courseId(request.getCourseId())
                .userId(request.getUserId())
                .message(request.getMessage())
                .parentId(request.getParentId())
                .build();

        return repository.save(post);
    }

    @Override
    public List<DiscussionPost> getCoursePosts(Long courseId) {
        return repository.findByCourseId(courseId);
    }
}
