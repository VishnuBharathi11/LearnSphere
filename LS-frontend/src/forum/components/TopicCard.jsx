import { Link, useLocation } from "react-router-dom";
import { ThumbsUp, Trash2 } from "lucide-react";
import forumService from "../services/forumService";
import { getForumRoleLabel } from "../utils/role";

const TopicCard = ({ topic, onLike, isLiked, canManage = false, onDeleteTopic }) => {
  const location = useLocation();
  const totalReplies = forumService.countReplies(topic.replies);
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
    <article className="forum-topic-card">
      <div className="forum-topic-card-main">
        <Link to={getTopicLink()} className="forum-topic-title-link">
          <h3>{topic.title}</h3>
        </Link>

        <p className="forum-topic-preview">{topic.content}</p>

        <div className="forum-meta-row">
          <span className="forum-pill">
            {topic.author}
            <span className="forum-role-label">{getForumRoleLabel(topic.authorRole)}</span>
          </span>
          <span className="forum-pill">{new Date(topic.createdAt).toLocaleString()}</span>
          <span className="forum-pill forum-pill-accent">{totalReplies} replies</span>
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
      </div>
    </article>
  );
};

export default TopicCard;
