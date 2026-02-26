import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import "./ForumPage.scss";
import { getCurrentUser } from "../../services/userProfileStore.js";
import { createReply, createThread, listThreads } from "../../services/discussionApi";

const getDisplayName = (user) => {
  return (
    user?.name ||
    user?.username ||
    user?.fullName ||
    user?.email?.split("@")?.[0] ||
    "User"
  );
};

function ForumPage() {
  const currentUser = getCurrentUser();
  const [threads, setThreads] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const legacyCourseId = "general";

  useEffect(() => {
    let active = true;
    async function loadThreads() {
      try {
        const data = await listThreads(legacyCourseId, { page: 0, size: 100 });
        if (!active) return;
        const normalized = Array.isArray(data?.items)
          ? data.items.map((item) => ({
              id: item.id,
              title: item.title,
              message: item.content,
              authorId: item.authorId,
              authorName: item.author,
              authorRole: item.authorRole,
              createdAt: item.createdAt,
              replies: Array.isArray(item.replies) ? item.replies : [],
            }))
          : [];
        setThreads(normalized);
      } catch {
        if (!active) return;
        setThreads([]);
      }
    }
    loadThreads();
    return () => {
      active = false;
    };
  }, []);

  const sortedThreads = useMemo(() => {
    return [...threads].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [threads]);

  if (!currentUser) {
    return <p className="forum-unauthorized">Please login to use the discussion forum.</p>;
  }

  const handleCreateThread = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) return;

    const created = await createThread(legacyCourseId, {
      title: cleanTitle,
      content: cleanMessage,
    });
    const nextThread = {
      id: created?.id || Date.now(),
      title: created?.title || cleanTitle,
      message: created?.content || cleanMessage,
      authorId: currentUser.id,
      authorName: created?.author || getDisplayName(currentUser),
      authorRole: created?.authorRole || currentUser.role || "learner",
      createdAt: created?.createdAt || new Date().toISOString(),
      replies: [],
    };
    setThreads((prev) => [nextThread, ...prev]);
    setTitle("");
    setMessage("");
  };

  const handleReply = async (threadId, e) => {
    e.preventDefault();
    const draft = (replyDrafts[threadId] || "").trim();
    if (!draft) return;
    const created = await createReply(threadId, { content: draft });
    const nextReply = {
      id: created?.id || Date.now(),
      message: created?.content || draft,
      authorId: currentUser.id,
      authorName: created?.author || getDisplayName(currentUser),
      authorRole: created?.authorRole || currentUser.role || "learner",
      createdAt: created?.createdAt || new Date().toISOString(),
    };
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        const safeReplies = Array.isArray(thread.replies) ? thread.replies : [];
        return { ...thread, replies: [...safeReplies, nextReply] };
      })
    );
    setReplyDrafts((prev) => ({ ...prev, [threadId]: "" }));
  };

  return (
    <div className="forum-page">
      <div className="forum-header">
        <div className="title-block">
          <MessageSquareText size={24} />
          <div>
            <h1>Discussion Forum</h1>
            <p>Start a discussion and reply to others.</p>
          </div>
        </div>
      </div>

      <form className="thread-form" onSubmit={handleCreateThread}>
        <h2>Create Discussion</h2>
        <input
          type="text"
          placeholder="Discussion title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <textarea
          placeholder="Write your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={1500}
        />
        <button type="submit">
          <Send size={16} />
          Post Discussion
        </button>
      </form>

      <section className="thread-list">
        {sortedThreads.length === 0 ? (
          <div className="empty-state">No discussions yet. Be the first to post.</div>
        ) : (
          sortedThreads.map((thread) => (
            <article className="thread-card" key={thread.id}>
              <header>
                <h3>{thread.title}</h3>
                <p>
                  {thread.authorName} ({thread.authorRole}) •{" "}
                  {new Date(thread.createdAt).toLocaleString()}
                </p>
              </header>

              <p className="thread-message">{thread.message}</p>

              <div className="reply-section">
                <h4>Replies ({Array.isArray(thread.replies) ? thread.replies.length : 0})</h4>

                <div className="reply-list">
                  {(thread.replies || []).length === 0 ? (
                    <p className="no-replies">No replies yet.</p>
                  ) : (
                    (thread.replies || []).map((reply) => (
                      <div className="reply-item" key={reply.id}>
                        <p className="reply-meta">
                          {reply.authorName} ({reply.authorRole}) •{" "}
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                        <p>{reply.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form className="reply-form" onSubmit={(e) => handleReply(thread.id, e)}>
                  <input
                    type="text"
                    placeholder="Write a reply"
                    value={replyDrafts[thread.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))
                    }
                    maxLength={800}
                  />
                  <button type="submit">Reply</button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default ForumPage;

