import { useState } from "react";
import { ChevronDown, ChevronRight, Flag, Reply, ThumbsUp, Trash2, X } from "lucide-react";
import ReplyBox from "./ReplyBox";
import ReportModal from "./ReportModal";
import { getForumRoleLabel } from "../utils/role";

const ReplyItem = ({
  reply,
  topicId,
  depth = 0,
  onVoteReply,
  onReply,
  onDeleteReply,
  onReportReply,
  canManage = false,
  currentUserId,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const userVote = reply.votedBy?.["self"] || (reply.votedBy?.[currentUserId] ?? null);

  const handleNestedReply = async (content) => {
    const result = await onReply(topicId, { content, parentReplyId: reply.id });

    if (result?.ok) {
      setIsReplying(false);
    }

    return result;
  };

  const hasChildren = Array.isArray(reply.replies) && reply.replies.length > 0;

  return (
    <div className="forum-reply-item" style={{ marginLeft: `${depth * 18}px` }}>
      <div className="forum-reply-header">
        <strong className="forum-reply-author">
          {reply.author}
          <span className="forum-role-label">{getForumRoleLabel(reply.authorRole)}</span>
        </strong>
        <span>{new Date(reply.createdAt).toLocaleString()}</span>
      </div>

      <p className="forum-reply-content" dangerouslySetInnerHTML={{ __html: reply.content }} />

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

        <button
          type="button"
          className="forum-btn ghost forum-btn-icon"
          onClick={() => setReportOpen(true)}
          title="Report reply"
          aria-label="Report reply"
        >
          <Flag size={14} />
        </button>

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

        {hasChildren ? (
          <button
            type="button"
            className="forum-btn ghost forum-btn-icon"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? "Collapse replies" : "Expand replies"}
            aria-label={isExpanded ? "Collapse replies" : "Expand replies"}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : null}
      </div>

      {isReplying ? (
        <ReplyBox onSubmit={handleNestedReply} placeholder="Write a nested reply..." buttonLabel="Post" />
      ) : null}

      {hasChildren && isExpanded ? (
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
              onReportReply={onReportReply}
              canManage={canManage}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : null}

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(reason) => onReportReply(reply.id, reason)}
      />
    </div>
  );
};

export default ReplyItem;
