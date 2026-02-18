package com.learnsphere.discussion.controller;

import com.learnsphere.discussion.dto.DiscussionRequest;
import com.learnsphere.discussion.entity.DiscussionPost;
import com.learnsphere.discussion.service.DiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discussion")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService service;

    @PostMapping
    public DiscussionPost create(@RequestBody DiscussionRequest request) {
        return service.createPost(request);
    }

    @GetMapping("/{courseId}")
    public List<DiscussionPost> getPosts(@PathVariable Long courseId) {
        return service.getCoursePosts(courseId);
    }
}
