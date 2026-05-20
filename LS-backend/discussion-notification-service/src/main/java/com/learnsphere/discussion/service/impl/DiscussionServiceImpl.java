package com.learnsphere.discussion.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
// import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.learnsphere.discussion.client.CourseClient;
import com.learnsphere.discussion.dto.request.AuthenticatedActor;
import com.learnsphere.discussion.dto.request.CreateReplyRequest;
import com.learnsphere.discussion.dto.request.CreateThreadRequest;
import com.learnsphere.discussion.dto.request.ReportReplyRequest;
import com.learnsphere.discussion.dto.response.PagedThreadsResponse;
import com.learnsphere.discussion.dto.response.ReplyNodeResponse;
import com.learnsphere.discussion.dto.response.ThreadDetailResponse;
import com.learnsphere.discussion.dto.response.ThreadSummaryResponse;
import com.learnsphere.discussion.dto.response.VoteResponse;
import com.learnsphere.discussion.exception.ForumForbiddenException;
import com.learnsphere.discussion.exception.ForumNotFoundException;
import com.learnsphere.discussion.model.ForumRole;
import com.learnsphere.discussion.model.ReplyDocument;
import com.learnsphere.discussion.model.ReportEntry;
import com.learnsphere.discussion.model.ThreadDocument;
import com.learnsphere.discussion.repository.ReplyRepository;
import com.learnsphere.discussion.repository.ThreadRepository;
import com.learnsphere.discussion.service.DiscussionService;
import com.learnsphere.discussion.service.NotificationService;
import com.learnsphere.discussion.util.ContentSanitizer;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscussionServiceImpl implements DiscussionService {

    private static final int DEFAULT_REPLY_PAGE_SIZE = 20;

    private final ThreadRepository threadRepository;
    private final ReplyRepository replyRepository;
    private final NotificationService notificationService;
    private final CourseClient courseClient;
    private final ContentSanitizer sanitizer;

    @Override
    public ThreadSummaryResponse createThread(String courseId, CreateThreadRequest request, AuthenticatedActor actor) {
        validateLearnerOrAbove(actor);

        ThreadDocument thread = ThreadDocument.builder()
            .courseId(courseId)
            .title(sanitizer.sanitize(request.getTitle()))
            .content(sanitizer.sanitize(request.getContent()))
            .authorId(actor.getActorId())
            .authorName(resolveAuthorName(actor, request.getAuthorName()))
            .authorRole(resolveRole(actor.getRole()))
            .upvotes(new ArrayList<>())
            .createdAt(Instant.now())
            .isLocked(false)
            .isArchived(false)
            .replyCount(0)
            .build();

        ThreadDocument saved = threadRepository.save(thread);

        courseClient.getCourseById(courseId, null)
            .map(course -> course.getInstructorId())
            .filter(instructorId -> instructorId != null && !instructorId.isBlank())
            .filter(instructorId -> !Objects.equals(instructorId, actor.getActorId()))
            .ifPresent(instructorId ->
                notificationService.createNotification(
                    instructorId,
                    "New learner question",
                    actor.getActorId() + " posted a new discussion: " + saved.getTitle(),
                    courseId,
                    saved.getId()
                )
            );

        return toThreadSummary(saved, actor.getActorId());
    }

    @Override
    public PagedThreadsResponse getThreadsByCourse(String courseId, int page, int size, AuthenticatedActor actor) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ThreadDocument> paged = threadRepository.findByCourseIdAndIsArchivedFalse(courseId, pageable);

        List<ThreadSummaryResponse> items = paged.getContent().stream()
            .map(thread -> toThreadSummary(thread, actor.getActorId()))
            .toList();

        return PagedThreadsResponse.builder()
            .items(items)
            .page(paged.getNumber())
            .size(paged.getSize())
            .totalItems(paged.getTotalElements())
            .totalPages(paged.getTotalPages())
            .build();
    }

    @Override
    public ThreadDetailResponse getThreadById(String threadId, int page, int size, AuthenticatedActor actor) {
        ThreadDocument thread = getThreadOrThrow(threadId);

        int safePage = Math.max(page, 0);
        int safeSize = clampSize(size <= 0 ? DEFAULT_REPLY_PAGE_SIZE : size);
        Pageable replyPage = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "createdAt"));

        Page<ReplyDocument> topLevel = replyRepository.findByThreadIdAndParentReplyIdIsNullAndIsDeletedFalse(threadId, replyPage);
        List<ReplyDocument> allReplies = replyRepository.findByThreadIdAndIsDeletedFalse(threadId);
        Map<String, List<ReplyDocument>> repliesByParent = groupByParent(allReplies);

        List<ReplyNodeResponse> topNodes = topLevel.getContent().stream()
            .map(reply -> toReplyNode(reply, repliesByParent, actor.getActorId()))
            .toList();

        return ThreadDetailResponse.builder()
            .thread(toThreadSummary(thread, actor.getActorId()))
            .replies(topNodes)
            .page(topLevel.getNumber())
            .size(topLevel.getSize())
            .totalTopLevelReplies(topLevel.getTotalElements())
            .totalPages(topLevel.getTotalPages())
            .build();
    }

    @Override
    public ThreadDetailResponse createReply(String threadId, CreateReplyRequest request, AuthenticatedActor actor) {
        validateLearnerOrAbove(actor);

        ThreadDocument thread = getThreadOrThrow(threadId);
        if (thread.isLocked()) {
            throw new ForumForbiddenException("Thread is locked by moderator");
        }

        String parentReplyId = normalizeId(request.getParentReplyId());
        if (parentReplyId != null) {
            ReplyDocument parent = replyRepository.findById(parentReplyId)
                .orElseThrow(() -> new ForumNotFoundException("Parent reply not found"));
            if (!Objects.equals(parent.getThreadId(), threadId)) {
                throw new ForumForbiddenException("Parent reply does not belong to this thread");
            }
        }

        ReplyDocument reply = ReplyDocument.builder()
            .threadId(threadId)
            .parentReplyId(parentReplyId)
            .content(sanitizer.sanitize(request.getContent()))
            .authorId(actor.getActorId())
            .authorName(resolveAuthorName(actor, request.getAuthorName()))
            .authorRole(resolveRole(actor.getRole()))
            .upvotes(new ArrayList<>())
            .reports(new ArrayList<>())
            .createdAt(Instant.now())
            .isDeleted(false)
            .build();

        replyRepository.save(reply);

        long totalReplies = replyRepository.countByThreadIdAndIsDeletedFalse(threadId);
        thread.setReplyCount(totalReplies);
        threadRepository.save(thread);

        if (!Objects.equals(thread.getAuthorId(), actor.getActorId())) {
            notificationService.createNotification(
                thread.getAuthorId(),
                "New reply on your thread",
                actor.getActorId() + " replied to: " + thread.getTitle(),
                thread.getCourseId(),
                thread.getId()
            );
        }

        return getThreadById(threadId, 0, DEFAULT_REPLY_PAGE_SIZE, actor);
    }

    @Override
    public VoteResponse upvoteThread(String threadId, AuthenticatedActor actor) {
        validateLearnerOrAbove(actor);
        ThreadDocument thread = getThreadOrThrow(threadId);

        toggleVote(thread.getUpvotes(), actor.getActorId());
        ThreadDocument saved = threadRepository.save(thread);

        return VoteResponse.builder()
            .id(saved.getId())
            .upvoteCount(saved.getUpvotes().size())
            .upvotedByCurrentUser(saved.getUpvotes().contains(actor.getActorId()))
            .build();
    }

    @Override
    public VoteResponse upvoteReply(String replyId, AuthenticatedActor actor) {
        validateLearnerOrAbove(actor);
        ReplyDocument reply = replyRepository.findById(replyId)
            .orElseThrow(() -> new ForumNotFoundException("Reply not found"));

        toggleVote(reply.getUpvotes(), actor.getActorId());
        ReplyDocument saved = replyRepository.save(reply);

        return VoteResponse.builder()
            .id(saved.getId())
            .upvoteCount(saved.getUpvotes().size())
            .upvotedByCurrentUser(saved.getUpvotes().contains(actor.getActorId()))
            .build();
    }

    @Override
    public void reportReply(String replyId, ReportReplyRequest request, AuthenticatedActor actor) {
        validateLearnerOrAbove(actor);
        ReplyDocument reply = replyRepository.findById(replyId)
            .orElseThrow(() -> new ForumNotFoundException("Reply not found"));

        boolean alreadyReported = reply.getReports().stream()
            .anyMatch(report -> Objects.equals(report.getUserId(), actor.getActorId()));

        if (!alreadyReported) {
            reply.getReports().add(
                ReportEntry.builder()
                    .userId(actor.getActorId())
                    .reason(sanitizer.sanitize(request.getReason()))
                    .createdAt(Instant.now())
                    .build()
            );
            replyRepository.save(reply);
        }
    }

    @Override
    public void lockThread(String threadId, boolean locked, AuthenticatedActor actor, String authHeader) {
        ThreadDocument thread = getThreadOrThrow(threadId);
        assertCanModerate(thread, actor, authHeader);
        thread.setLocked(locked);
        threadRepository.save(thread);
    }

    @Override
    public void deleteThread(String threadId, AuthenticatedActor actor, String authHeader) {
        ThreadDocument thread = getThreadOrThrow(threadId);
        assertCanModerate(thread, actor, authHeader);

        if (isAdmin(actor)) {
            thread.setArchived(true);
            threadRepository.save(thread);
            return;
        }

        thread.setArchived(true);
        threadRepository.save(thread);
    }

    @Override
    public void deleteReply(String replyId, AuthenticatedActor actor, String authHeader) {
        ReplyDocument reply = replyRepository.findById(replyId)
            .orElseThrow(() -> new ForumNotFoundException("Reply not found"));

        ThreadDocument thread = getThreadOrThrow(reply.getThreadId());
        assertCanModerate(thread, actor, authHeader);

        reply.setDeleted(true);
        replyRepository.save(reply);

        long totalReplies = replyRepository.countByThreadIdAndIsDeletedFalse(thread.getId());
        thread.setReplyCount(totalReplies);
        threadRepository.save(thread);
    }

    @Override
    public List<ThreadSummaryResponse> getReportedThreadsByCourse(String courseId, AuthenticatedActor actor) {
        if (!isModerator(actor)) {
            throw new ForumForbiddenException("Only instructor/admin can access reported content");
        }

        Page<ThreadDocument> paged = threadRepository.findByCourseIdAndIsArchivedFalse(
            courseId,
            PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return paged.getContent().stream()
            .filter(thread -> {
                List<ReplyDocument> replies = replyRepository.findByThreadIdAndIsDeletedFalse(thread.getId());
                return replies.stream().anyMatch(reply -> reply.getReports() != null && !reply.getReports().isEmpty());
            })
            .map(thread -> toThreadSummary(thread, actor.getActorId()))
            .toList();
    }

    private void assertCanModerate(ThreadDocument thread, AuthenticatedActor actor, String authHeader) {
        if (isAdmin(actor)) return;

        if (!isInstructor(actor)) {
            throw new ForumForbiddenException("Only instructor/admin can moderate");
        }

        boolean isCourseInstructor = courseClient.getCourseById(thread.getCourseId(), authHeader)
            .map(course -> Objects.equals(course.getInstructorId(), actor.getActorId()) || Objects.equals(course.getInstructorId(), actor.getActorEmail()))
            .orElse(false);

        if (!isCourseInstructor) {
            throw new ForumForbiddenException("Instructor can moderate only their own course threads");
        }
    }

    private ThreadDocument getThreadOrThrow(String threadId) {
        return threadRepository.findById(threadId)
            .filter(thread -> !thread.isArchived())
            .orElseThrow(() -> new ForumNotFoundException("Thread not found"));
    }

    private ThreadSummaryResponse toThreadSummary(ThreadDocument thread, String currentActorId) {
        return ThreadSummaryResponse.builder()
            .id(thread.getId())
            .courseId(thread.getCourseId())
            .title(thread.getTitle())
            .content(thread.getContent())
            .authorId(thread.getAuthorId())
            .authorName(thread.getAuthorName())
            .authorRole(thread.getAuthorRole() == null ? ForumRole.LEARNER.name() : thread.getAuthorRole().name())
            .upvoteCount(thread.getUpvotes() == null ? 0 : thread.getUpvotes().size())
            .replyCount(thread.getReplyCount())
            .createdAt(thread.getCreatedAt())
            .locked(thread.isLocked())
            .archived(thread.isArchived())
            .upvotedByCurrentUser(thread.getUpvotes() != null && thread.getUpvotes().contains(currentActorId))
            .build();
    }

    private ReplyNodeResponse toReplyNode(ReplyDocument reply, Map<String, List<ReplyDocument>> repliesByParent, String actorId) {
        List<ReplyDocument> children = repliesByParent.getOrDefault(reply.getId(), List.of());

        List<ReplyNodeResponse> childNodes = children.stream()
            .sorted(Comparator.comparing(ReplyDocument::getCreatedAt))
            .map(child -> toReplyNode(child, repliesByParent, actorId))
            .toList();

        return ReplyNodeResponse.builder()
            .id(reply.getId())
            .threadId(reply.getThreadId())
            .parentReplyId(reply.getParentReplyId())
            .content(reply.getContent())
            .authorId(reply.getAuthorId())
            .authorName(reply.getAuthorName())
            .authorRole(reply.getAuthorRole() == null ? ForumRole.LEARNER.name() : reply.getAuthorRole().name())
            .createdAt(reply.getCreatedAt())
            .upvoteCount(reply.getUpvotes() == null ? 0 : reply.getUpvotes().size())
            .upvotedByCurrentUser(reply.getUpvotes() != null && reply.getUpvotes().contains(actorId))
            .reportCount(reply.getReports() == null ? 0 : reply.getReports().size())
            .children(childNodes)
            .build();
    }

    private Map<String, List<ReplyDocument>> groupByParent(List<ReplyDocument> replies) {
        Map<String, List<ReplyDocument>> grouped = new HashMap<>();
        for (ReplyDocument reply : replies) {
            String parent = normalizeId(reply.getParentReplyId());
            if (parent == null) continue;
            grouped.computeIfAbsent(parent, k -> new ArrayList<>()).add(reply);
        }
        return grouped;
    }

    private String normalizeId(String id) {
        if (id == null || id.isBlank()) return null;
        return id.trim();
    }

    private void toggleVote(List<String> upvotes, String actorId) {
        if (upvotes == null) return;
        if (upvotes.contains(actorId)) {
            upvotes.remove(actorId);
        } else {
            upvotes.add(actorId);
        }
    }

    private String resolveAuthorName(AuthenticatedActor actor, String requestedName) {
        if (requestedName != null && !requestedName.isBlank()) {
            return sanitizer.sanitize(requestedName.trim());
        }

        String email = actor.getActorEmail();
        int at = email == null ? -1 : email.indexOf('@');
        return at > 0 ? email.substring(0, at) : actor.getActorId();
    }

    private ForumRole resolveRole(String role) {
        try {
            return ForumRole.valueOf((role == null ? "LEARNER" : role).toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ForumRole.LEARNER;
        }
    }

    private int clampSize(int size) {
        if (size < 1) return 20;
        return Math.min(size, 50);
    }

    private void validateLearnerOrAbove(AuthenticatedActor actor) {
        String role = actor.getRole() == null ? "" : actor.getRole().toUpperCase();
        if (!("LEARNER".equals(role) || "INSTRUCTOR".equals(role) || "ADMIN".equals(role))) {
            throw new ForumForbiddenException("Invalid forum role");
        }
    }

    private boolean isAdmin(AuthenticatedActor actor) {
        return "ADMIN".equalsIgnoreCase(actor.getRole());
    }

    private boolean isInstructor(AuthenticatedActor actor) {
        return "INSTRUCTOR".equalsIgnoreCase(actor.getRole());
    }

    private boolean isModerator(AuthenticatedActor actor) {
        return isAdmin(actor) || isInstructor(actor);
    }
}
