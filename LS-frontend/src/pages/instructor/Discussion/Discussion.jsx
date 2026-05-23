import React, { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Send,
  Flag,
} from "lucide-react";
import "./Discussion.scss";
import { getInstructorCourses } from "../../../services/courseApi";
import { createDiscussionPost, getCourseDiscussions } from "../../../services/discussionApi";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function Discussion() {
  const currentUser = getCurrentUser() || {};
  const currentRole = String(currentUser?.role || "").toLowerCase();

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [metaById, setMetaById] = useState({});

  const persistMeta = (next) => {
    setMetaById(next);
  };

  const deriveStatus = (thread) => {
    const meta = metaById[thread.id] || {};
    if (meta.flagged) return "flagged";
    if (thread.hasInstructorReply) return "answered";
    if (meta.viewed) return "viewed";
    return "pending";
  };

  const markViewed = (threadId) => {
    const current = metaById[threadId] || {};
    if (current.viewed) return;
    persistMeta({
      ...metaById,
      [threadId]: { ...current, viewed: true },
    });
  };

  useEffect(() => {
    if (currentRole !== "instructor" || !currentUser?.id) {
      setThreads([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function loadThreads() {
      setLoading(true);
      try {
        const courses = await getInstructorCourses(String(currentUser.id), 0, 300);
        if (!active) return;

        const courseMap = new Map((courses || []).map((c) => [String(c.id), c.courseName]));
        const postsByCourse = await Promise.all(
          (courses || []).map((course) => getCourseDiscussions(course.id).catch(() => []))
        );
        if (!active) return;

        const allPosts = postsByCourse.flat();
        const topLevel = allPosts.filter((p) => p.parentId == null);
        const repliesByParentId = allPosts
          .filter((p) => p.parentId != null)
          .reduce((acc, post) => {
            const key = String(post.parentId);
            if (!acc[key]) acc[key] = [];
            acc[key].push(post);
            return acc;
          }, {});

        const normalizedThreads = topLevel
          .map((post) => {
            const replies = (repliesByParentId[String(post.id)] || [])
              .sort((a, b) => Number(a.id) - Number(b.id))
              .map((r) => ({
                id: r.id,
                author: Number(r.userId) === Number(currentUser.id) ? "You" : `Learner #${r.userId}`,
                role: Number(r.userId) === Number(currentUser.id) ? "instructor" : "learner",
                text: r.message || "",
              }));

            return {
              id: post.id,
              courseId: post.courseId,
              subject: `Question in ${courseMap.get(String(post.courseId)) || "Course"}`,
              student: `Learner #${post.userId}`,
              courseName: courseMap.get(String(post.courseId)) || `Course ${post.courseId}`,
              message: post.message || "",
              createdAt: post.id ? new Date(Number(post.id)).toISOString() : new Date().toISOString(),
              repliesData: replies,
              replies: replies.length,
              hasInstructorReply: replies.some((r) => r.role === "instructor"),
            };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setThreads(normalizedThreads);
        setSelected((prev) => {
          if (!prev) return normalizedThreads[0] || null;
          return normalizedThreads.find((t) => t.id === prev.id) || normalizedThreads[0] || null;
        });
      } catch {
        if (!active) return;
        setThreads([]);
        setSelected(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadThreads();

    return () => {
      active = false;
    };
  }, [currentRole, currentUser?.id]);

  const stats = useMemo(() => {
    const statusList = threads.map((t) => deriveStatus(t));
    return {
      total: threads.length,
      pending: statusList.filter((s) => s === "pending").length,
      viewed: statusList.filter((s) => s === "viewed").length,
      flagged: statusList.filter((s) => s === "flagged").length,
      answered: statusList.filter((s) => s === "answered").length,
    };
  }, [threads, metaById]);

  const filteredThreads = useMemo(() => {
    return threads.filter((d) => {
      const matchFilter = activeFilter === "all" || deriveStatus(d) === activeFilter;
      const q = search.toLowerCase();
      const matchSearch =
        String(d.subject || "").toLowerCase().includes(q) ||
        String(d.student || "").toLowerCase().includes(q) ||
        String(d.courseName || "").toLowerCase().includes(q) ||
        String(d.message || "").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [threads, activeFilter, search, metaById]);

  const toggleFlag = (threadId) => {
    const current = metaById[threadId] || {};
    persistMeta({
      ...metaById,
      [threadId]: {
        ...current,
        flagged: !current.flagged,
        viewed: true,
      },
    });
  };

  const sendReply = async () => {
    const text = replyText.trim();
    if (!selected || !text) return;

    try {
      await createDiscussionPost({
        courseId: selected.courseId,
        userId: currentUser.id,
        message: text,
        parentId: selected.id,
      });

      const addedReply = {
        id: Date.now(),
        author: "You",
        role: "instructor",
        text,
      };

      const updatedThreads = threads.map((thread) => {
        if (thread.id !== selected.id) return thread;
        const replies = Array.isArray(thread.repliesData) ? thread.repliesData : [];
        return {
          ...thread,
          repliesData: [...replies, addedReply],
          replies: replies.length + 1,
          hasInstructorReply: true,
        };
      });

      setThreads(updatedThreads);
      setSelected(updatedThreads.find((thread) => thread.id === selected.id) || null);
      setReplyText("");
      markViewed(selected.id);
    } catch {
      // Keep current page state if network fails.
    }
  };

  if (currentRole !== "instructor") {
    return (
      <p style={{ padding: 40 }}>
        Access denied. This page is available only for instructor accounts.
      </p>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <div className="discussion-layout">
      <div className="discussion-page">
        <div className="discussion-stats">
          <Stat icon={MessageSquare} label="Total Discussions" value={stats.total} color="blue" />
          <Stat icon={Clock} label="Pending" value={stats.pending} color="yellow" />
          <Stat icon={CheckCircle} label="Viewed" value={stats.viewed} color="blue" />
          <Stat icon={AlertTriangle} label="Flagged" value={stats.flagged} color="red" />
          <Stat icon={CheckCircle} label="Answered" value={stats.answered} color="green" />
        </div>

        <div className="discussion-controls">
          <div className="discussion-search-box">
            <Search size={18} />
            <input
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="discussion-filter-buttons">
            {["all", "pending", "viewed", "flagged", "answered"].map((f) => (
              <button
                key={f}
                className={activeFilter === f ? `active ${f}` : ""}
                onClick={() => setActiveFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="discussion-list">
          {filteredThreads.length === 0 ? (
            <p>No discussions found</p>
          ) : (
            filteredThreads.map((d) => (
              <div
                key={d.id}
                className={`discussion-card ${selected?.id === d.id ? "active-thread" : ""}`}
                onClick={() => {
                  setSelected(d);
                  markViewed(d.id);
                }}
              >
                <div className="discussion-info">
                  <h3>{d.subject}</h3>
                  <p className="meta">
                    <strong>{d.student}</strong> | {d.courseName}
                  </p>
                  <p className="message">{d.message}</p>
                  <p className="time">
                    {new Date(d.createdAt).toLocaleString()} | {d.replies || 0} replies
                  </p>
                </div>
                <div className="discussion-actions">
                  <button
                    className="flag"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFlag(d.id);
                    }}
                  >
                    <Flag size={16} /> {(metaById[d.id] || {}).flagged ? "Unflag" : "Flag"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="discussion-thread-panel">
            <h3>Thread: {selected.subject}</h3>
            <p className="meta">
              {selected.student} | {selected.courseName}
            </p>
            <div className="thread-message">{selected.message}</div>

            {(selected.repliesData || []).map((reply) => (
              <div key={reply.id} className="thread-reply">
                <strong>{reply.author}</strong>
                <p>{reply.text}</p>
              </div>
            ))}

            <div className="thread-reply-box">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a response to learner..."
              />
              <button onClick={sendReply}>
                <Send size={15} /> Send Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }) {
  const Icon = icon;
  return (
    <div className={`discussion-stat-card ${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default Discussion;

