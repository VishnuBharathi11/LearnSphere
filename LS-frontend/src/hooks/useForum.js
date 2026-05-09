import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createReply,
  createThread,
  deleteReply,
  deleteThread,
  getThread,
  listThreads,
  lockThread,
  reportReply,
  upvoteReply,
  upvoteThread,
} from "../services/discussionApi";
import { getFriendlyErrorMessage } from "../services/apiError";
import { normalizeForumRole } from "../utils/forumRole";

const THREAD_PAGE_SIZE = 15;
const REPLY_PAGE_SIZE = 20;

const getUserId = (currentUser) => {
  if (!currentUser) return "anonymous";
  return String(currentUser.id || currentUser.userId || currentUser.email || currentUser.username || "anonymous");
};

const getUserName = (currentUser) => {
  if (!currentUser) return "Anonymous";
  return (
    currentUser.name ||
    currentUser.fullName ||
    currentUser.username ||
    currentUser.email?.split("@")[0] ||
    "Anonymous"
  );
};

const roleFromPath = () => {
  const pathname = String(window.location?.pathname || "");
  if (pathname.startsWith("/instructor-layout/")) return "instructor";
  if (pathname.startsWith("/admin-layout/")) return "admin";
  if (pathname.startsWith("/student-layout/")) return "learner";
  return null;
};

const normalizeThread = (item) => ({
  id: item.id,
  courseId: item.courseId,
  title: item.title,
  content: item.content,
  author: item.authorName,
  authorId: item.authorId,
  authorRole: normalizeForumRole(item.authorRole),
  createdAt: item.createdAt,
  likes: Number(item.upvoteCount || 0),
  likedBy: item.upvotedByCurrentUser ? ["self"] : [],
  replyCount: Number(item.replyCount || 0),
  isLocked: Boolean(item.locked),
  isArchived: Boolean(item.archived),
});

const normalizeReplyNode = (item) => ({
  id: item.id,
  topicId: item.threadId,
  parentReplyId: item.parentReplyId,
  content: item.content,
  author: item.authorName,
  authorId: item.authorId,
  authorRole: normalizeForumRole(item.authorRole),
  createdAt: item.createdAt,
  upvotes: Number(item.upvoteCount || 0),
  likes: Number(item.upvoteCount || 0),
  reportCount: Number(item.reportCount || 0),
  votedBy: item.upvotedByCurrentUser ? { self: "up" } : {},
  replies: Array.isArray(item.children) ? item.children.map(normalizeReplyNode) : [],
});

const countReplies = (replies = []) =>
  replies.reduce((total, reply) => total + 1 + countReplies(reply.replies || []), 0);

const flattenReplies = (replies = []) => {
  const all = [];
  const stack = [...replies];
  while (stack.length) {
    const node = stack.shift();
    all.push(node);
    if (Array.isArray(node.replies) && node.replies.length > 0) {
      stack.unshift(...node.replies);
    }
  }
  return all;
};

export const useForum = (courseId, currentUser) => {
  const [topics, setTopics] = useState([]);
  const [threadDetail, setThreadDetail] = useState(null);
  const [threadPage, setThreadPage] = useState(0);
  const [threadMeta, setThreadMeta] = useState({ totalPages: 0, totalItems: 0 });
  const [replyMeta, setReplyMeta] = useState({ page: 0, totalPages: 0, totalTopLevelReplies: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => getUserId(currentUser), [currentUser]);
  const userName = useMemo(() => getUserName(currentUser), [currentUser]);
  const userRole = useMemo(() => roleFromPath() || normalizeForumRole(currentUser?.role), [currentUser]);

  const refresh = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError("");
    try {
      const data = await listThreads(courseId, { page: threadPage, size: THREAD_PAGE_SIZE });
      const items = Array.isArray(data?.items) ? data.items.map(normalizeThread) : [];
      setTopics(items);
      setThreadMeta({
        totalPages: Number(data?.totalPages || 0),
        totalItems: Number(data?.totalItems || 0),
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Failed to fetch discussions"));
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, threadPage]);

  const fetchThreadById = useCallback(async (topicId, page = 0, append = false) => {
    setLoading(true);
    setError("");
    try {
      const data = await getThread(topicId, { page, size: REPLY_PAGE_SIZE });
      const topic = normalizeThread(data.thread || {});
      const newReplies = Array.isArray(data.replies) ? data.replies.map(normalizeReplyNode) : [];

      setReplyMeta({
        page: Number(data.page || 0),
        totalPages: Number(data.totalPages || 0),
        totalTopLevelReplies: Number(data.totalTopLevelReplies || 0),
      });

      setThreadDetail((prev) => {
        if (!append || !prev || String(prev.id) !== String(topic.id)) {
          return { ...topic, replies: newReplies };
        }
        return { ...topic, replies: [...(prev.replies || []), ...newReplies] };
      });

      setTopics((prev) => {
        const exists = prev.some((item) => String(item.id) === String(topic.id));
        if (exists) return prev.map((item) => (String(item.id) === String(topic.id) ? topic : item));
        return [topic, ...prev];
      });

      return { ok: true };
    } catch (err) {
      const message = getFriendlyErrorMessage(err, "Failed to fetch thread");
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTopic = useCallback(
    async ({ title, content }) => {
      if (!courseId) return { ok: false, error: "Course context missing" };

      try {
        await createThread(courseId, { title, content, authorName: userName });
        await refresh();
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: getFriendlyErrorMessage(err, "Unable to create topic."),
        };
      }
    },
    [courseId, refresh, userName]
  );

  const addReply = useCallback(
    async (topicId, { content, parentReplyId = null }) => {
      try {
        await createReply(topicId, { content, parentReplyId, authorName: userName });
        await fetchThreadById(topicId, 0, false);
        await refresh();
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: getFriendlyErrorMessage(err, "Unable to post reply."),
        };
      }
    },
    [fetchThreadById, refresh, userName]
  );

  const likeTopic = useCallback(
    async (topicId) => {
      try {
        const vote = await upvoteThread(topicId);
        setTopics((prev) =>
          prev.map((item) =>
            String(item.id) === String(topicId)
              ? {
                  ...item,
                  likes: Number(vote.upvoteCount || 0),
                  likedBy: vote.upvotedByCurrentUser ? ["self"] : [],
                }
              : item
          )
        );

        setThreadDetail((prev) => {
          if (!prev || String(prev.id) !== String(topicId)) return prev;
          return {
            ...prev,
            likes: Number(vote.upvoteCount || 0),
            likedBy: vote.upvotedByCurrentUser ? ["self"] : [],
          };
        });

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const voteReply = useCallback(
    async (topicId, replyId, voteType = "up") => {
      if (voteType !== "up") return "blocked";
      try {
        const vote = await upvoteReply(replyId);
        await fetchThreadById(topicId, 0, false);
        return vote.upvotedByCurrentUser ? "up" : "removed";
      } catch {
        return "error";
      }
    },
    [fetchThreadById]
  );

  const reportReplyItem = useCallback(async (replyId, reason) => {
    try {
      await reportReply(replyId, { reason });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getFriendlyErrorMessage(err, "Unable to report reply.") };
    }
  }, []);

  const markNotificationsRead = useCallback(() => {
    return;
  }, []);

  const deleteTopic = useCallback(
    async (topicId) => {
      try {
        await deleteThread(topicId);
        setTopics((prev) => prev.filter((item) => String(item.id) !== String(topicId)));
        if (threadDetail && String(threadDetail.id) === String(topicId)) {
          setThreadDetail(null);
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: getFriendlyErrorMessage(err, "Unable to delete topic.") };
      }
    },
    [threadDetail]
  );

  const deleteReplyItem = useCallback(
    async (topicId, replyId) => {
      try {
        await deleteReply(replyId);
        await fetchThreadById(topicId, 0, false);
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: getFriendlyErrorMessage(err, "Unable to delete reply.") };
      }
    },
    [fetchThreadById, refresh]
  );

  const toggleThreadLock = useCallback(
    async (topicId, locked) => {
      try {
        await lockThread(topicId, locked);
        await fetchThreadById(topicId, 0, false);
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: getFriendlyErrorMessage(err, "Unable to update lock state.") };
      }
    },
    [fetchThreadById, refresh]
  );

  const unreadNotifications = useMemo(() => [], []);

  return {
    topics,
    threadDetail,
    loading,
    error,
    threadPage,
    setThreadPage,
    threadMeta,
    replyMeta,
    userId,
    userRole,
    refresh,
    fetchThreadById,
    createTopic,
    addReply,
    likeTopic,
    voteReply,
    reportReply: reportReplyItem,
    deleteTopic,
    deleteReply: deleteReplyItem,
    toggleThreadLock,
    markNotificationsRead,
    notifications: [],
    unreadCount: unreadNotifications.length,
    countReplies,
    flattenReplies,
  };
};

export default useForum;
