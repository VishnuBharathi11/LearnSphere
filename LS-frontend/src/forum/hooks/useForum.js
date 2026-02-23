import { useCallback, useEffect, useMemo, useState } from "react";
import forumService from "../services/forumService";
import { normalizeForumRole } from "../utils/role";

const getUserId = (currentUser) => {
  if (!currentUser) return "anonymous";
  return String(currentUser.id || currentUser.email || currentUser.username || "anonymous");
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

const getUserRole = (currentUser) => {
  const pathname =
    typeof window !== "undefined" ? String(window.location?.pathname || "") : "";

  if (pathname.startsWith("/instructor-layout/")) {
    return "instructor";
  }

  if (pathname.startsWith("/admin-layout/")) {
    return "admin";
  }

  if (pathname.startsWith("/student-layout/")) {
    return "learner";
  }

  return normalizeForumRole(currentUser?.role);
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const insertReplyRecursively = (replies, parentReplyId, nextReply) => {
  return replies.map((reply) => {
    if (String(reply.id) === String(parentReplyId)) {
      return {
        ...reply,
        replies: [...toArray(reply.replies), nextReply],
      };
    }

    return {
      ...reply,
      replies: insertReplyRecursively(toArray(reply.replies), parentReplyId, nextReply),
    };
  });
};

const updateReplyRecursively = (replies, replyId, updater) => {
  return replies.map((reply) => {
    if (String(reply.id) === String(replyId)) {
      return updater(reply);
    }

    return {
      ...reply,
      replies: updateReplyRecursively(toArray(reply.replies), replyId, updater),
    };
  });
};

const removeReplyRecursively = (replies, replyId) => {
  const safeReplyId = String(replyId);
  let removed = false;

  const nextReplies = toArray(replies).reduce((acc, reply) => {
    if (String(reply.id) === safeReplyId) {
      removed = true;
      return acc;
    }

    const { replies: nextChildren, removed: childRemoved } = removeReplyRecursively(
      toArray(reply.replies),
      safeReplyId
    );

    if (childRemoved) {
      removed = true;
    }

    acc.push({
      ...reply,
      replies: nextChildren,
    });

    return acc;
  }, []);

  return { replies: nextReplies, removed };
};

export const useForum = (courseId, currentUser) => {
  const [topics, setTopics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const userId = useMemo(() => getUserId(currentUser), [currentUser]);
  const userName = useMemo(() => getUserName(currentUser), [currentUser]);
  const userRole = useMemo(() => getUserRole(currentUser), [currentUser]);

  const refresh = useCallback(() => {
    const nextTopics = forumService.getTopics(courseId);
    setTopics(nextTopics);

    if (userId) {
      setNotifications(forumService.getNotifications(userId));
    }
  }, [courseId, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTopic = useCallback(
    ({ title, content }) => {
      const cleanTitle = title?.trim();
      const cleanContent = content?.trim();

      if (!cleanTitle || !cleanContent) {
        return { ok: false, error: "Title and content are required." };
      }

      const optimisticTopic = {
        id: forumService.generateId("topic"),
        courseId: courseId || "general",
        title: cleanTitle,
        content: cleanContent,
        author: userName,
        authorId: userId,
        authorRole: userRole,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        replies: [],
      };

      setTopics((prev) => [optimisticTopic, ...prev]);
      const savedTopic = forumService.createTopic(optimisticTopic);
      setTopics((prev) => prev.map((topic) => (topic.id === optimisticTopic.id ? savedTopic : topic)));

      return { ok: true, topic: savedTopic };
    },
    [courseId, userId, userName, userRole]
  );

  const addReply = useCallback(
    (topicId, { content, parentReplyId = null }) => {
      const cleanContent = content?.trim();

      if (!cleanContent) {
        return { ok: false, error: "Reply cannot be empty." };
      }

      const optimisticReply = {
        id: forumService.generateId("reply"),
        topicId,
        parentReplyId,
        content: cleanContent,
        author: userName,
        authorId: userId,
        authorRole: userRole,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        upvotes: 0,
        downvotes: 0,
        votedBy: {},
        replies: [],
      };

      let notificationTarget = null;

      setTopics((prev) =>
        prev.map((topic) => {
          if (String(topic.id) !== String(topicId)) return topic;

          notificationTarget = topic.authorId !== userId ? topic.authorId : null;

          if (parentReplyId) {
            return {
              ...topic,
              replies: insertReplyRecursively(topic.replies, parentReplyId, optimisticReply),
            };
          }

          return {
            ...topic,
            replies: [...topic.replies, optimisticReply],
          };
        })
      );

      const savedReply = forumService.addReply(topicId, optimisticReply);
      refresh();

      if (notificationTarget) {
        forumService.createNotification({
          type: "reply",
          topicId,
          replyId: savedReply?.id || optimisticReply.id,
          userId: notificationTarget,
          message: `${userName} replied to your topic.`,
          read: false,
        });
      }

      if (notificationTarget === userId) {
        setNotifications((prev) => prev);
      } else {
        setNotifications(forumService.getNotifications(userId));
      }

      return { ok: true, reply: savedReply || optimisticReply };
    },
    [refresh, userId, userName, userRole]
  );

  const likeTopic = useCallback(
    (topicId) => {
      let liked = false;

      setTopics((prev) =>
        prev.map((topic) => {
          if (String(topic.id) !== String(topicId)) return topic;
          const alreadyLiked = topic.likedBy.includes(userId);
          liked = !alreadyLiked;
          return {
            ...topic,
            likes: alreadyLiked ? Math.max(0, topic.likes - 1) : topic.likes + 1,
            likedBy: alreadyLiked
              ? topic.likedBy.filter((id) => id !== userId)
              : [...topic.likedBy, userId],
          };
        })
      );

      forumService.likeTopic(topicId, userId);

      return liked;
    },
    [userId]
  );

  const voteReply = useCallback(
    (topicId, replyId, voteType) => {
      let actionResult = null;

      setTopics((prev) =>
        prev.map((topic) => {
          if (String(topic.id) !== String(topicId)) return topic;

          return {
            ...topic,
            replies: updateReplyRecursively(topic.replies, replyId, (reply) => {
              const currentVote = reply.votedBy?.[userId] || null;
              let nextUpvotes = Number(reply.upvotes || 0);
              let nextDownvotes = Number(reply.downvotes || 0);
              const nextVotedBy = { ...(reply.votedBy || {}) };

              if (currentVote === voteType) {
                if (voteType === "up") nextUpvotes = Math.max(0, nextUpvotes - 1);
                if (voteType === "down") nextDownvotes = Math.max(0, nextDownvotes - 1);
                delete nextVotedBy[userId];
                actionResult = "removed";
              } else {
                if (currentVote === "up") nextUpvotes = Math.max(0, nextUpvotes - 1);
                if (currentVote === "down") nextDownvotes = Math.max(0, nextDownvotes - 1);

                if (voteType === "up") nextUpvotes += 1;
                if (voteType === "down") nextDownvotes += 1;

                nextVotedBy[userId] = voteType;
                actionResult = voteType;
              }

              return {
                ...reply,
                upvotes: nextUpvotes,
                downvotes: nextDownvotes,
                votedBy: nextVotedBy,
                likes: nextUpvotes,
                likedBy: Object.entries(nextVotedBy)
                  .filter(([, vote]) => vote === "up")
                  .map(([id]) => id),
              };
            }),
          };
        })
      );

      forumService.voteReply(topicId, replyId, userId, voteType);

      return actionResult;
    },
    [userId]
  );

  const markNotificationsRead = useCallback(
    (topicId = null) => {
      const updated = forumService.markNotificationsRead(userId, topicId);
      setNotifications(updated);
    },
    [userId]
  );

  const deleteTopic = useCallback((topicId) => {
    const safeTopicId = String(topicId);

    setTopics((prev) => prev.filter((topic) => String(topic.id) !== safeTopicId));
    const deleted = forumService.deleteTopic(safeTopicId);

    return { ok: deleted };
  }, []);

  const deleteReply = useCallback((topicId, replyId) => {
    const safeTopicId = String(topicId);
    const safeReplyId = String(replyId);
    let removed = false;

    setTopics((prev) =>
      prev.map((topic) => {
        if (String(topic.id) !== safeTopicId) {
          return topic;
        }

        const result = removeReplyRecursively(toArray(topic.replies), safeReplyId);
        removed = result.removed;

        return {
          ...topic,
          replies: result.replies,
        };
      })
    );

    const deleted = forumService.deleteReply(safeTopicId, safeReplyId);

    return { ok: removed || deleted };
  }, []);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications]
  );

  return {
    topics,
    notifications,
    unreadCount: unreadNotifications.length,
    refresh,
    createTopic,
    addReply,
    likeTopic,
    voteReply,
    deleteTopic,
    deleteReply,
    markNotificationsRead,
  };
};

export default useForum;
