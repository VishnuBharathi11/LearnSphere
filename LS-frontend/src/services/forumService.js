import { normalizeForumRole } from "../utils/forumRole";

const TOPICS_KEY = "forum_topics";
const NOTIFICATIONS_KEY = "forum_notifications";

const parseJSON = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeReply = (reply) => ({
  id: String(reply?.id || generateId("reply")),
  topicId: String(reply?.topicId || ""),
  parentReplyId: reply?.parentReplyId ? String(reply.parentReplyId) : null,
  author: reply?.author || "Anonymous",
  authorId: String(reply?.authorId || "anonymous"),
  authorRole: normalizeForumRole(reply?.authorRole),
  content: (reply?.content || "").trim(),
  createdAt: reply?.createdAt || new Date().toISOString(),
  likes: Number.isFinite(reply?.likes) ? reply.likes : 0,
  likedBy: toArray(reply?.likedBy).map(String),
  upvotes: Number.isFinite(reply?.upvotes)
    ? reply.upvotes
    : Number.isFinite(reply?.likes)
      ? reply.likes
      : 0,
  downvotes: Number.isFinite(reply?.downvotes) ? reply.downvotes : 0,
  votedBy: typeof reply?.votedBy === "object" && reply?.votedBy !== null ? reply.votedBy : {},
  replies: toArray(reply?.replies).map(normalizeReply),
});

const normalizeTopic = (topic) => ({
  id: String(topic?.id || generateId("topic")),
  courseId: String(topic?.courseId || "general"),
  title: (topic?.title || "").trim(),
  content: (topic?.content || "").trim(),
  author: topic?.author || "Anonymous",
  authorId: String(topic?.authorId || "anonymous"),
  authorRole: normalizeForumRole(topic?.authorRole),
  createdAt: topic?.createdAt || new Date().toISOString(),
  likes: Number.isFinite(topic?.likes) ? topic.likes : 0,
  likedBy: toArray(topic?.likedBy).map(String),
  replies: toArray(topic?.replies).map((reply) =>
    normalizeReply({ ...reply, topicId: topic?.id || reply?.topicId })
  ),
});

const saveTopics = (topics) => {
  localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
};

const saveNotifications = (notifications) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

const loadTopics = () => {
  const topics = parseJSON(localStorage.getItem(TOPICS_KEY), []);
  return toArray(topics).map(normalizeTopic);
};

const loadNotifications = () => {
  const notifications = parseJSON(localStorage.getItem(NOTIFICATIONS_KEY), []);
  return toArray(notifications);
};

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
  let removed = false;
  const safeReplyId = String(replyId);

  const nextReplies = toArray(replies).reduce((acc, reply) => {
    if (String(reply.id) === safeReplyId) {
      removed = true;
      return acc;
    }

    const { replies: childReplies, removed: childRemoved } = removeReplyRecursively(
      reply.replies,
      safeReplyId
    );

    if (childRemoved) {
      removed = true;
    }

    acc.push({
      ...reply,
      replies: childReplies,
    });

    return acc;
  }, []);

  return { replies: nextReplies, removed };
};

const countReplies = (replies) => {
  return toArray(replies).reduce(
    (total, reply) => total + 1 + countReplies(reply.replies),
    0
  );
};

const generateId = (prefix = "id") => {
  const part = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${part}`;
};

const forumService = {
  TOPICS_KEY,
  NOTIFICATIONS_KEY,

  generateId,

  loadFromLocalStorage() {
    const topics = loadTopics();
    const notifications = loadNotifications();
    return { topics, notifications };
  },

  saveToLocalStorage({ topics, notifications } = {}) {
    if (topics) {
      saveTopics(toArray(topics).map(normalizeTopic));
    }

    if (notifications) {
      saveNotifications(toArray(notifications));
    }
  },

  getTopics(courseId) {
    const topics = loadTopics();

    const filtered = courseId
      ? topics.filter((topic) => String(topic.courseId) === String(courseId))
      : topics;

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  createTopic(topic) {
    const topics = loadTopics();
    const nextTopic = normalizeTopic(topic);
    saveTopics([nextTopic, ...topics]);
    return nextTopic;
  },

  deleteTopic(topicId) {
    const safeTopicId = String(topicId);
    const topics = loadTopics();
    const notifications = loadNotifications();

    const nextTopics = topics.filter((topic) => String(topic.id) !== safeTopicId);
    const deleted = nextTopics.length !== topics.length;

    if (!deleted) {
      return false;
    }

    const nextNotifications = notifications.filter(
      (notification) => String(notification.topicId) !== safeTopicId
    );

    saveTopics(nextTopics);
    saveNotifications(nextNotifications);
    return true;
  },

  addReply(topicId, reply) {
    const topics = loadTopics();
    const safeTopicId = String(topicId);
    let savedReply = null;

    const updatedTopics = topics.map((topic) => {
      if (String(topic.id) !== safeTopicId) {
        return topic;
      }

      const nextReply = normalizeReply({ ...reply, topicId: safeTopicId });
      savedReply = nextReply;

      if (nextReply.parentReplyId) {
        return {
          ...topic,
          replies: insertReplyRecursively(topic.replies, nextReply.parentReplyId, nextReply),
        };
      }

      return {
        ...topic,
        replies: [...topic.replies, nextReply],
      };
    });

    saveTopics(updatedTopics);
    return savedReply;
  },

  deleteReply(topicId, replyId) {
    const safeTopicId = String(topicId);
    const safeReplyId = String(replyId);
    const topics = loadTopics();
    let deleted = false;

    const nextTopics = topics.map((topic) => {
      if (String(topic.id) !== safeTopicId) {
        return topic;
      }

      const { replies, removed } = removeReplyRecursively(topic.replies, safeReplyId);
      deleted = removed;

      return {
        ...topic,
        replies,
      };
    });

    if (!deleted) {
      return false;
    }

    saveTopics(nextTopics);
    return true;
  },

  likeTopic(topicId, userId) {
    const topics = loadTopics();
    const safeTopicId = String(topicId);
    const safeUserId = String(userId);
    let updatedTopic = null;

    const updatedTopics = topics.map((topic) => {
      if (String(topic.id) !== safeTopicId) {
        return topic;
      }

      const alreadyLiked = topic.likedBy.includes(safeUserId);
      const nextTopic = alreadyLiked
        ? {
            ...topic,
            likes: Math.max(0, topic.likes - 1),
            likedBy: topic.likedBy.filter((id) => id !== safeUserId),
          }
        : {
            ...topic,
            likes: topic.likes + 1,
            likedBy: [...topic.likedBy, safeUserId],
          };

      updatedTopic = nextTopic;
      return nextTopic;
    });

    saveTopics(updatedTopics);
    return updatedTopic;
  },

  likeReply(topicId, replyId, userId) {
    return this.voteReply(topicId, replyId, userId, "up");
  },

  voteReply(topicId, replyId, userId, voteType) {
    const topics = loadTopics();
    const safeTopicId = String(topicId);
    const safeReplyId = String(replyId);
    const safeUserId = String(userId);
    const safeVoteType = voteType === "down" ? "down" : "up";
    let updatedReply = null;

    const updatedTopics = topics.map((topic) => {
      if (String(topic.id) !== safeTopicId) {
        return topic;
      }

      return {
        ...topic,
        replies: updateReplyRecursively(topic.replies, safeReplyId, (reply) => {
          const currentVote = reply.votedBy?.[safeUserId] || null;
          let nextUpvotes = Number(reply.upvotes || 0);
          let nextDownvotes = Number(reply.downvotes || 0);
          const nextVotedBy = { ...(reply.votedBy || {}) };

          if (currentVote === safeVoteType) {
            if (safeVoteType === "up") {
              nextUpvotes = Math.max(0, nextUpvotes - 1);
            } else {
              nextDownvotes = Math.max(0, nextDownvotes - 1);
            }
            delete nextVotedBy[safeUserId];
          } else {
            if (currentVote === "up") {
              nextUpvotes = Math.max(0, nextUpvotes - 1);
            }
            if (currentVote === "down") {
              nextDownvotes = Math.max(0, nextDownvotes - 1);
            }

            if (safeVoteType === "up") {
              nextUpvotes += 1;
            } else {
              nextDownvotes += 1;
            }

            nextVotedBy[safeUserId] = safeVoteType;
          }

          const nextReply = {
            ...reply,
            upvotes: nextUpvotes,
            downvotes: nextDownvotes,
            votedBy: nextVotedBy,
            likes: nextUpvotes,
            likedBy: Object.entries(nextVotedBy)
              .filter(([, vote]) => vote === "up")
              .map(([id]) => id),
          };

          updatedReply = nextReply;
          return nextReply;
        }),
      };
    });

    saveTopics(updatedTopics);
    return updatedReply;
  },

  createNotification(notification) {
    const notifications = loadNotifications();
    const nextNotification = {
      id: notification?.id || generateId("notif"),
      type: notification?.type || "reply",
      topicId: String(notification?.topicId || ""),
      replyId: notification?.replyId ? String(notification.replyId) : null,
      userId: String(notification?.userId || ""),
      message: notification?.message || "",
      read: Boolean(notification?.read),
      createdAt: notification?.createdAt || new Date().toISOString(),
    };

    saveNotifications([nextNotification, ...notifications]);
    return nextNotification;
  },

  getNotifications(userId) {
    const safeUserId = String(userId);
    const notifications = loadNotifications();
    return notifications.filter((notification) => String(notification.userId) === safeUserId);
  },

  markNotificationsRead(userId, topicId = null) {
    const safeUserId = String(userId);
    const safeTopicId = topicId ? String(topicId) : null;
    const notifications = loadNotifications();

    const updated = notifications.map((notification) => {
      const userMatch = String(notification.userId) === safeUserId;
      const topicMatch = safeTopicId ? String(notification.topicId) === safeTopicId : true;

      if (userMatch && topicMatch) {
        return { ...notification, read: true };
      }

      return notification;
    });

    saveNotifications(updated);
    return updated.filter((notification) => String(notification.userId) === safeUserId);
  },

  countReplies,
};

export default forumService;
