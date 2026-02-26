package com.learnsphere.discussion.service;

import java.util.List;

import com.learnsphere.discussion.dto.request.AuthenticatedActor;
import com.learnsphere.discussion.dto.request.CreateReplyRequest;
import com.learnsphere.discussion.dto.request.CreateThreadRequest;
import com.learnsphere.discussion.dto.request.ReportReplyRequest;
import com.learnsphere.discussion.dto.response.PagedThreadsResponse;
import com.learnsphere.discussion.dto.response.ThreadDetailResponse;
import com.learnsphere.discussion.dto.response.ThreadSummaryResponse;
import com.learnsphere.discussion.dto.response.VoteResponse;

public interface DiscussionService {
    ThreadSummaryResponse createThread(String courseId, CreateThreadRequest request, AuthenticatedActor actor);

    PagedThreadsResponse getThreadsByCourse(String courseId, int page, int size, AuthenticatedActor actor);

    ThreadDetailResponse getThreadById(String threadId, int page, int size, AuthenticatedActor actor);

    ThreadDetailResponse createReply(String threadId, CreateReplyRequest request, AuthenticatedActor actor);

    VoteResponse upvoteThread(String threadId, AuthenticatedActor actor);

    VoteResponse upvoteReply(String replyId, AuthenticatedActor actor);

    void reportReply(String replyId, ReportReplyRequest request, AuthenticatedActor actor);

    void lockThread(String threadId, boolean locked, AuthenticatedActor actor, String authHeader);

    void deleteThread(String threadId, AuthenticatedActor actor, String authHeader);

    void deleteReply(String replyId, AuthenticatedActor actor, String authHeader);

    List<ThreadSummaryResponse> getReportedThreadsByCourse(String courseId, AuthenticatedActor actor);
}
