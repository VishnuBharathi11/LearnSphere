import { useState } from "react";
import { Reply, ThumbsDown, ThumbsUp, Trash2, X } from "lucide-react";
import ReplyBox from "./ReplyBox";
import { getForumRoleLabel } from "../utils/role";

const ReplyItem = ({
  reply,
  topicId,
  depth = 0,
  onVoteReply,
  onReply,
  onDeleteReply,
  canManage = false,
  currentUserId,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const userVote = reply.votedBy?.[currentUserId] || null;

  const handleNestedReply = (content) => {
    const result = onReply(topicId, { content, parentReplyId: reply.id });

    if (result?.ok) {
      setIsReplying(false);
    }

    return result;
  };

  return (
    <div className="forum-reply-item" style={{ marginLeft: `${depth * 18}px` }}>
      <div className="forum-reply-header">
        <strong className="forum-reply-author">
          {reply.author}
          <span className="forum-role-label">{getForumRoleLabel(reply.authorRole)}</span>
        </strong>
        <span>{new Date(reply.createdAt).toLocaleString()}</span>
      </div>

      <p className="forum-reply-content">{reply.content}</p>

      <div className="forum-reply-actions">
        <div className="forum-vote-wrap">
          <button
            className={`forum-like-icon-btn${userVote === "up" ? " is-active" : ""}`}
            type="button"
            onClick={() => onVoteReply(topicId, reply.id, "up")}
            title={userVote === "up" ? "Remove upvote" : "Upvote"}
            aria-label="Upvote"
          >
            <ThumbsUp size={14} />
          </button>
          <span className="forum-like-count">{reply.upvotes ?? reply.likes ?? 0}</span>
        </div>

        <div className="forum-vote-wrap">
          <button
            className={`forum-like-icon-btn forum-downvote-btn${userVote === "down" ? " is-active" : ""}`}
            type="button"
            onClick={() => onVoteReply(topicId, reply.id, "down")}
            title={userVote === "down" ? "Remove downvote" : "Downvote"}
            aria-label="Downvote"
          >
            <ThumbsDown size={14} />
          </button>
          <span className="forum-like-count">{reply.downvotes ?? 0}</span>
        </div>
        {canManage ? (
          <button
            type="button"
            className="forum-like-icon-btn forum-danger-icon-btn"
            onClick={() => onDeleteReply?.(topicId, reply.id)}
            title="Delete reply"
            aria-label="Delete reply"
          >
            <Trash2 size={14} />
          </button>
        ) : null}
        <button
          type="button"
          className="forum-btn ghost forum-btn-icon"
          onClick={() => setIsReplying((prev) => !prev)}
          title={isReplying ? "Cancel reply" : "Reply"}
          aria-label={isReplying ? "Cancel reply" : "Reply"}
        >
          {isReplying ? <X size={14} /> : <Reply size={14} />}
        </button>
      </div>

      {isReplying ? (
        <ReplyBox onSubmit={handleNestedReply} placeholder="Write a nested reply..." buttonLabel="Post" />
      ) : null}

      {reply.replies?.length ? (
        <div className="forum-reply-children">
          {reply.replies.map((child) => (
            <ReplyItem
              key={child.id}
              reply={child}
              topicId={topicId}
              depth={depth + 1}
              onVoteReply={onVoteReply}
              onReply={onReply}
              onDeleteReply={onDeleteReply}
              canManage={canManage}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ReplyItem;
