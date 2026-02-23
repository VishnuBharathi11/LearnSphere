import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ThumbsUp, Trash2 } from "lucide-react";
import ReplyItem from "../components/ReplyItem";
import ReplyBox from "../components/ReplyBox";
import useForum from "../hooks/useForum";
import forumService from "../services/forumService";
import { getForumRoleLabel, normalizeForumRole } from "../utils/role";
import "../styles/forum.scss";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const TopicPage = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdmin =
    location.pathname.startsWith("/admin-layout/") ||
    normalizeForumRole(currentUser?.role) === "admin";
  const currentUserId = String(
    currentUser?.id || currentUser?.email || currentUser?.username || "anonymous"
  );

  const { topics, addReply, likeTopic, voteReply, deleteTopic, deleteReply, markNotificationsRead } = useForum(
    undefined,
    currentUser
  );

  const topic = useMemo(
    () => topics.find((item) => String(item.id) === String(topicId)),
    [topicId, topics]
  );
  const replyBottomRef = useRef(null);
  const totalReplies = useMemo(() => forumService.countReplies(topic?.replies || []), [topic]);
  const topicLikedByUser = Boolean(topic?.likedBy?.includes(currentUserId));
  const backToForumPath = useMemo(() => {
    if (location.pathname.startsWith("/instructor-layout/")) {
      return "/instructor-layout/forum";
    }

    if (location.pathname.startsWith("/admin-layout/")) {
      return "/admin-layout/forum";
    }

    if (location.pathname.startsWith("/student-layout/")) {
      return "/student-layout/forum";
    }

    return `/courses/${topic?.courseId || "general"}/forum`;
  }, [location.pathname, topic?.courseId]);

  const handleDeleteTopic = () => {
    if (!window.confirm("Delete this topic and all its replies?")) {
      return;
    }

    const result = deleteTopic(topic.id);

    if (result?.ok) {
      navigate(backToForumPath, { replace: true });
    }
  };

  const handleDeleteReply = (targetTopicId, replyId) => {
    if (!window.confirm("Delete this reply?")) {
      return;
    }

    deleteReply(targetTopicId, replyId);
  };

  useEffect(() => {
    markNotificationsRead(topicId);
  }, [markNotificationsRead, topicId]);

  useEffect(() => {
    if (replyBottomRef.current) {
      replyBottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [totalReplies]);

  if (!topic) {
    return (
      <section className="forum-page-shell">
        <div className="forum-empty-state">Topic not found.</div>
      </section>
    );
  }

  return (
    <section className="forum-page-shell">
      <div className="forum-back-link-row">
        <Link
          to={backToForumPath}
          className="forum-back-link forum-btn ghost forum-btn-icon"
          title="Back to discussion"
          aria-label="Back to discussion"
        >
          <ArrowLeft size={15} />
        </Link>
      </div>

      <article className="forum-topic-detail">
        <h1>{topic.title}</h1>
        <p className="forum-topic-preview">{topic.content}</p>

        <div className="forum-meta-row">
          <span className="forum-pill">
            {topic.author}
            <span className="forum-role-label">{getForumRoleLabel(topic.authorRole)}</span>
          </span>
          <span className="forum-pill">{new Date(topic.createdAt).toLocaleString()}</span>
          <span className="forum-pill forum-pill-accent">{totalReplies} replies</span>
        </div>

        <div className="forum-topic-actions">
          {isAdmin ? (
            <button
              className="forum-like-icon-btn forum-danger-icon-btn"
              type="button"
              onClick={handleDeleteTopic}
              title="Delete topic"
              aria-label="Delete topic"
            >
              <Trash2 size={16} />
            </button>
          ) : null}
          <div className="forum-like-wrap">
            <button
              className={`forum-like-icon-btn${topicLikedByUser ? " is-active" : ""}`}
              type="button"
              onClick={() => likeTopic(topic.id)}
              title={topicLikedByUser ? "Unlike topic" : "Like topic"}
              aria-label="Like topic"
            >
              <ThumbsUp size={16} />
            </button>
            <span className="forum-like-count">{topic.likes}</span>
          </div>
        </div>
      </article>

      <section className="forum-replies-section">
        <h2>Replies</h2>
        <ReplyBox
          onSubmit={(content) => addReply(topic.id, { content })}
          placeholder="Write a reply..."
          buttonLabel="Reply"
        />

        {topic.replies?.length ? (
          <div className="forum-replies-list">
            {topic.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                topicId={topic.id}
                onVoteReply={voteReply}
                onReply={addReply}
                onDeleteReply={handleDeleteReply}
                canManage={isAdmin}
                currentUserId={currentUserId}
              />
            ))}
            <div ref={replyBottomRef} />
          </div>
        ) : (
          <div className="forum-empty-state">No replies yet. Start the discussion.</div>
        )}
      </section>
    </section>
  );
};

export default TopicPage;
