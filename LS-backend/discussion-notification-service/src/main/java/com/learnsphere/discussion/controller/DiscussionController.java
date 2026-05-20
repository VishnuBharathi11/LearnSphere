package com.learnsphere.discussion.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.learnsphere.discussion.dto.request.AuthenticatedActor;
import com.learnsphere.discussion.dto.request.CreateReplyRequest;
import com.learnsphere.discussion.dto.request.CreateThreadRequest;
import com.learnsphere.discussion.dto.request.ReportReplyRequest;
import com.learnsphere.discussion.dto.response.PagedThreadsResponse;
import com.learnsphere.discussion.dto.response.ThreadDetailResponse;
import com.learnsphere.discussion.dto.response.ThreadSummaryResponse;
import com.learnsphere.discussion.dto.response.VoteResponse;
import com.learnsphere.discussion.service.DiscussionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api")
public class DiscussionController {

    private final DiscussionService discussionService;

    @PostMapping("/courses/{courseId}/threads")
    public ResponseEntity<ThreadSummaryResponse> createThread(
        @PathVariable String courseId,
        @Valid @RequestBody CreateThreadRequest request,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        return ResponseEntity.ok(discussionService.createThread(courseId, request, actor));
    }

    @GetMapping("/courses/{courseId}/threads")
    public ResponseEntity<PagedThreadsResponse> listThreads(
        @PathVariable String courseId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        return ResponseEntity.ok(discussionService.getThreadsByCourse(courseId, page, size, actor));
    }

    @GetMapping("/courses/{courseId}/threads/reported")
    public ResponseEntity<?> reportedThreads(
        @PathVariable String courseId,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        return ResponseEntity.ok(discussionService.getReportedThreadsByCourse(courseId, actor));
    }

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<ThreadDetailResponse> getThread(
        @PathVariable String threadId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        return ResponseEntity.ok(discussionService.getThreadById(threadId, page, size, actor));
    }

    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<ThreadDetailResponse> createReply(
        @PathVariable String threadId,
        @Valid @RequestBody CreateReplyRequest request,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        return ResponseEntity.ok(discussionService.createReply(threadId, request, actor));
    }

    @PutMapping("/threads/{id}/upvote")
    public ResponseEntity<VoteResponse> upvoteThread(
        @PathVariable String id,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        return ResponseEntity.ok(discussionService.upvoteThread(id, actor));
    }

    @PutMapping("/replies/{id}/upvote")
    public ResponseEntity<VoteResponse> upvoteReply(
        @PathVariable String id,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        return ResponseEntity.ok(discussionService.upvoteReply(id, actor));
    }

    @PostMapping("/replies/{id}/report")
    public ResponseEntity<Void> reportReply(
        @PathVariable String id,
        @Valid @RequestBody ReportReplyRequest request,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        discussionService.reportReply(id, request, actor);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/threads/{id}/lock")
    public ResponseEntity<Void> lockThread(
        @PathVariable String id,
        @RequestParam boolean locked,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        discussionService.lockThread(id, locked, actor, authorization);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/threads/{id}")
    public ResponseEntity<Void> deleteThread(
        @PathVariable String id,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        discussionService.deleteThread(id, actor, authorization);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/replies/{id}")
    public ResponseEntity<Void> deleteReply(
        @PathVariable String id,
        @RequestHeader(value = "X-User-Id", required = false) String userId,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
        Authentication authentication
    ) {
        AuthenticatedActor actor = AuthenticatedActor.from(authentication, userId);
        discussionService.deleteReply(id, actor, authorization);
        return ResponseEntity.noContent().build();
    }
}
