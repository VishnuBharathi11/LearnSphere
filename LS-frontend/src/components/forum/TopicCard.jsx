import { Link, useLocation } from "react-router-dom";
import { MessageCircle, ThumbsUp, Trash2 } from "lucide-react";
function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const TopicCard = ({ topic, onLike, isLiked, canManage = false, onDeleteTopic, onReply, isFocused = false }) => {
  const location = useLocation();
  const totalReplies = Number(topic.replyCount || 0);
  const plainTitle = stripHtml(topic.title);
  const plainContent = stripHtml(topic.content);
  const showTitle = plainTitle && plainTitle.toLowerCase() !== plainContent.toLowerCase();
  const getTopicLink = () => {
    if (location.pathname.startsWith("/instructor-layout/")) {
      return `/instructor-layout/forum/topic/${topic.id}`;
    }

    if (location.pathname.startsWith("/admin-layout/")) {
      return `/admin-layout/forum/topic/${topic.id}`;
    }

    if (location.pathname.startsWith("/student-layout/")) {
      return `/student-layout/forum/topic/${topic.id}`;
    }

    return `/forum/topic/${topic.id}`;
  };

  return (
    <article className={`forum-topic-card ${isFocused ? "is-focused" : ""}`} id={`topic-${topic.id}`}>
      <div className="forum-topic-card-main">
        {showTitle ? (
          <Link to={getTopicLink()} className="forum-topic-title-link">
            <h3>{topic.title}</h3>
          </Link>
        ) : null}

        <p className="forum-topic-preview" dangerouslySetInnerHTML={{ __html: topic.content }} />

        <div className="forum-meta-row">
          <span className="forum-pill">{topic.author}</span>
          <span className="forum-pill">{new Date(topic.createdAt).toLocaleString()}</span>
          <span className="forum-pill forum-pill-accent">{totalReplies} replies</span>
          {topic.isLocked ? <span className="forum-pill">Locked</span> : null}
        </div>
      </div>

      <div className="forum-topic-actions">
        {canManage ? (
          <button
            className="forum-like-icon-btn forum-danger-icon-btn"
            type="button"
            onClick={() => onDeleteTopic?.(topic.id)}
            title="Delete topic"
            aria-label="Delete topic"
          >
            <Trash2 size={16} />
          </button>
        ) : null}
        <div className="forum-like-wrap">
          <button
            className={`forum-like-icon-btn${isLiked ? " is-active" : ""}`}
            type="button"
            onClick={() => onLike(topic.id)}
            title={isLiked ? "Unlike topic" : "Like topic"}
            aria-label="Like topic"
          >
            <ThumbsUp size={16} />
          </button>
          <span className="forum-like-count">{topic.likes}</span>
        </div>
        <button
          className="forum-btn ghost forum-btn-icon"
          type="button"
          onClick={() => onReply?.(topic.id)}
          title="Reply"
          aria-label="Reply"
        >
          <MessageCircle size={14} />
        </button>
      </div>
    </article>
  );
};

export default TopicCard;
