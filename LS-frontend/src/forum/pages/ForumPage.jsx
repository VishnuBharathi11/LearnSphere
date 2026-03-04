import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import TopicCard from "../components/TopicCard";
import CreateTopicModal from "../components/CreateTopicModal";
import useForum from "../hooks/useForum";
import { getInstructorCourses, getPublishedCourses } from "../../services/courseApi";
import { getAdminSettings } from "../../services/adminApi";
import { normalizeForumRole } from "../utils/role";
import "../styles/forum.scss";
import { getCurrentUser } from "../../services/userProfileStore.js";

const ForumPage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const currentUserId = String(currentUser?.id || currentUser?.userId || currentUser?.email || "anonymous");
  const currentRole = normalizeForumRole(currentUser?.role);
  const searchParams = new URLSearchParams(location.search);
  const focusedThreadId = String(searchParams.get("threadId") || "");

  const [courseOptions, setCourseOptions] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(courseId || "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [discussionEnabled, setDiscussionEnabled] = useState(true);

  const isInstructor = location.pathname.startsWith("/instructor-layout/") || currentRole === "instructor";
  const isAdmin = location.pathname.startsWith("/admin-layout/") || currentRole === "admin";
  const canCreate = currentRole === "learner" || currentRole === "instructor" || currentRole === "admin";

  const {
    topics,
    loading,
    error,
    createTopic,
    likeTopic,
    deleteTopic,
    refresh,
    threadPage,
    setThreadPage,
    threadMeta,
    countReplies,
  } = useForum(activeCourseId, currentUser);

  useEffect(() => {
    let active = true;
    async function loadFeatureSettings() {
      try {
        const settings = await getAdminSettings();
        if (!active) return;
        setDiscussionEnabled(Boolean(settings?.discussions ?? true));
      } catch {
        if (!active) return;
        setDiscussionEnabled(true);
      }
    }
    loadFeatureSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        let courses = [];
        if (isInstructor && currentUser?.id) {
          courses = await getInstructorCourses(String(currentUser.id), 0, 100);
        } else {
          courses = await getPublishedCourses(0, 100);
        }

        if (!active) return;

        const normalized = (Array.isArray(courses) ? courses : []).map((item) => ({
          id: String(item.id),
          name: item.courseName || item.title || `Course ${item.id}`,
        }));

        setCourseOptions(normalized);

        if (!activeCourseId && normalized.length > 0) {
          setActiveCourseId(normalized[0].id);
        }
      } catch {
        if (!active) return;
        setCourseOptions([]);
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, [activeCourseId, currentUser?.id, isInstructor]);

  useEffect(() => {
    setThreadPage(0);
  }, [activeCourseId, setThreadPage]);

  useEffect(() => {
    refresh();
  }, [refresh, threadPage]);

  const filteredTopics = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    let nextTopics = topics.filter((topic) => topic.title.toLowerCase().includes(searchTerm));

    if (filter === "mostLiked") {
      nextTopics = [...nextTopics].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    if (filter === "unanswered") {
      nextTopics = nextTopics.filter((topic) => countReplies(topic.replies || []) === 0 && Number(topic.replyCount || 0) === 0);
    }

    if (filter === "latest") {
      nextTopics = [...nextTopics].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (focusedThreadId) {
      nextTopics = [...nextTopics].sort((a, b) => {
        const aFocused = String(a.id) === focusedThreadId ? 1 : 0;
        const bFocused = String(b.id) === focusedThreadId ? 1 : 0;
        return bFocused - aFocused;
      });
    }

    return nextTopics;
  }, [countReplies, filter, focusedThreadId, search, topics]);

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("Delete this topic and all its replies?")) {
      return;
    }
    await deleteTopic(topicId);
    await refresh();
  };

  if (!discussionEnabled) {
    return (
      <section className="forum-page-shell">
        <div className="forum-empty-state">Discussions are disabled by platform settings.</div>
      </section>
    );
  }

  return (
    <section className="forum-page-shell">
      <div className="forum-toolbar">
        <select
          className="forum-input"
          value={activeCourseId}
          onChange={(event) => setActiveCourseId(event.target.value)}
        >
          {courseOptions.length === 0 ? <option value="">No Courses</option> : null}
          {courseOptions.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <input
          className="forum-input"
          type="text"
          placeholder="Search topics by title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="forum-input"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="mostLiked">Most Liked</option>
          <option value="unanswered">Unanswered</option>
        </select>

        {canCreate && activeCourseId ? (
          <button
            className="forum-btn forum-btn-primary forum-btn-icon"
            type="button"
            onClick={() => setIsCreateOpen(true)}
            title="Create topic"
            aria-label="Create topic"
          >
            <Plus size={16} />
          </button>
        ) : null}
      </div>

      {error ? <p className="forum-error">{error}</p> : null}

      <div className="forum-topic-list">
        {loading ? (
          <div className="forum-empty-state">Loading discussions...</div>
        ) : filteredTopics.length === 0 ? (
          <div className="forum-empty-state">No discussions yet for this course.</div>
        ) : (
          filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onLike={likeTopic}
              onReply={(topicId) => {
                const query = new URLSearchParams();
                if (activeCourseId) query.set("courseId", String(activeCourseId));
                const qs = query.toString();
                navigate(`/forum/topic/${topicId}${qs ? `?${qs}` : ""}`);
              }}
              isFocused={focusedThreadId && String(topic.id) === focusedThreadId}
              isLiked={Boolean(topic.likedBy?.includes("self") || topic.likedBy?.includes(currentUserId))}
              canManage={isInstructor || isAdmin}
              onDeleteTopic={handleDeleteTopic}
            />
          ))
        )}
      </div>

      <div className="forum-pagination">
        <button
          className="forum-btn ghost"
          type="button"
          disabled={threadPage <= 0}
          onClick={() => setThreadPage((prev) => Math.max(prev - 1, 0))}
        >
          Prev
        </button>
        <span>
          Page {threadPage + 1} / {Math.max(threadMeta.totalPages, 1)}
        </span>
        <button
          className="forum-btn ghost"
          type="button"
          disabled={threadPage + 1 >= threadMeta.totalPages}
          onClick={() => setThreadPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      <CreateTopicModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createTopic}
      />
    </section>
  );
};

export default ForumPage;

