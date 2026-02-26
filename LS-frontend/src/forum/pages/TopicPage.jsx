import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, LockOpen, Trash2 } from "lucide-react";
import ReplyItem from "../components/ReplyItem";
import ReplyBox from "../components/ReplyBox";
import useForum from "../hooks/useForum";
import { getForumRoleLabel, normalizeForumRole } from "../utils/role";
import "../styles/forum.scss";

const getCurrentUser = () => {
  try {
    const raw = window.appStore.getItem("currentUser");
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

  const currentRole = normalizeForumRole(currentUser?.role);
  const isInstructor = location.pathname.startsWith("/instructor-layout/") || currentRole === "instructor";
  const isAdmin = location.pathname.startsWith("/admin-layout/") || currentRole === "admin";
  const canManage = isInstructor || isAdmin;
  const currentUserId = String(currentUser?.id || currentUser?.userId || currentUser?.email || "anonymous");

  const {
    threadDetail,
    replyMeta,
    loading,
    error,
    fetchThreadById,
    addReply,
    likeTopic,
    voteReply,
    reportReply,
    deleteTopic,
    deleteReply,
    toggleThreadLock,
  } = useForum(undefined, currentUser);

  const [actionError, setActionError] = useState("");
  const replyBottomRef = useRef(null);

  useEffect(() => {
    fetchThreadById(topicId, 0, false);
  }, [fetchThreadById, topicId]);

  useEffect(() => {
    if (replyBottomRef.current) {
      replyBottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [threadDetail?.replies]);

  const totalReplies = useMemo(() => Number(threadDetail?.replyCount || 0), [threadDetail?.replyCount]);
  const topicLikedByUser = Boolean(threadDetail?.likedBy?.includes("self") || threadDetail?.likedBy?.includes(currentUserId));

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

    return `/courses/${threadDetail?.courseId || "general"}/forum`;
  }, [location.pathname, threadDetail?.courseId]);

  const handleDeleteTopic = async () => {
    if (!window.confirm("Delete this topic and all its replies?")) {
      return;
    }

    const result = await deleteTopic(topicId);
    if (result?.ok) {
      navigate(backToForumPath, { replace: true });
      return;
    }

    setActionError(result?.error || "Unable to delete topic");
  };

  const handleDeleteReply = async (targetTopicId, replyId) => {
    if (!window.confirm("Delete this reply?")) {
      return;
    }

    const result = await deleteReply(targetTopicId, replyId);
    if (!result?.ok) {
      setActionError(result?.error || "Unable to delete reply");
    }
  };

  const handleToggleLock = async () => {
    const result = await toggleThreadLock(topicId, !threadDetail?.isLocked);
    if (!result?.ok) {
      setActionError(result?.error || "Unable to change lock state");
    }
  };

  if (loading && !threadDetail) {
    return (
      <section className="forum-page-shell">
        <div className="forum-empty-state">Loading thread...</div>
      </section>
    );
  }

  if (!threadDetail) {
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
        <h1>{threadDetail.title}</h1>
        <p className="forum-topic-preview" dangerouslySetInnerHTML={{ __html: threadDetail.content }} />

        <div className="forum-meta-row">
          <span className="forum-pill">
            {threadDetail.author}
            <span className="forum-role-label">{getForumRoleLabel(threadDetail.authorRole)}</span>
          </span>
          <span className="forum-pill">{new Date(threadDetail.createdAt).toLocaleString()}</span>
          <span className="forum-pill forum-pill-accent">{totalReplies} replies</span>
          {threadDetail.isLocked ? <span className="forum-pill">Locked</span> : null}
        </div>

        <div className="forum-topic-actions">
          {canManage ? (
            <>
              <button
                className="forum-like-icon-btn"
                type="button"
                onClick={handleToggleLock}
                title={threadDetail.isLocked ? "Unlock thread" : "Lock thread"}
                aria-label={threadDetail.isLocked ? "Unlock thread" : "Lock thread"}
              >
                {threadDetail.isLocked ? <LockOpen size={16} /> : <Lock size={16} />}
              </button>
              <button
                className="forum-like-icon-btn forum-danger-icon-btn"
                type="button"
                onClick={handleDeleteTopic}
                title="Delete topic"
                aria-label="Delete topic"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : null}
          <div className="forum-like-wrap">
            <button
              className={`forum-like-icon-btn${topicLikedByUser ? " is-active" : ""}`}
              type="button"
              onClick={() => likeTopic(threadDetail.id)}
              title={topicLikedByUser ? "Remove upvote" : "Upvote topic"}
              aria-label="Upvote topic"
            >
              ?
            </button>
            <span className="forum-like-count">{threadDetail.likes}</span>
          </div>
        </div>
      </article>

      <section className="forum-replies-section">
        <h2>Replies</h2>

        {threadDetail.isLocked ? (
          <div className="forum-empty-state">Thread is locked by moderator.</div>
        ) : (
          <ReplyBox
            onSubmit={(content) => addReply(threadDetail.id, { content })}
            placeholder="Write a reply..."
            buttonLabel="Reply"
          />
        )}

        {actionError || error ? <p className="forum-error">{actionError || error}</p> : null}

        {threadDetail.replies?.length ? (
          <div className="forum-replies-list">
            {threadDetail.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                topicId={threadDetail.id}
                onVoteReply={voteReply}
                onReply={addReply}
                onDeleteReply={handleDeleteReply}
                onReportReply={reportReply}
                canManage={canManage}
                currentUserId={currentUserId}
              />
            ))}
            <div ref={replyBottomRef} />
          </div>
        ) : (
          <div className="forum-empty-state">No replies yet. Start the discussion.</div>
        )}

        {replyMeta.page + 1 < replyMeta.totalPages ? (
          <div className="forum-load-more">
            <button
              className="forum-btn ghost"
              type="button"
              onClick={() => fetchThreadById(threadDetail.id, replyMeta.page + 1, true)}
            >
              Load More Replies
            </button>
          </div>
        ) : null}
      </section>
    </section>
  );
};

export default TopicPage;
