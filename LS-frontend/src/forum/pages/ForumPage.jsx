import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import TopicCard from "../components/TopicCard";
import CreateTopicModal from "../components/CreateTopicModal";
import useForum from "../hooks/useForum";
import forumService from "../services/forumService";
import { normalizeForumRole } from "../utils/role";
import "../styles/forum.scss";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const ForumPage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const activeCourseId = courseId || "general";
  const currentUser = getCurrentUser();
  const currentUserId = String(
    currentUser?.id || currentUser?.email || currentUser?.username || "anonymous"
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const isAdmin =
    location.pathname.startsWith("/admin-layout/") ||
    normalizeForumRole(currentUser?.role) === "admin";

  const { topics, createTopic, likeTopic, deleteTopic } = useForum(
    activeCourseId,
    currentUser
  );

  const handleDeleteTopic = (topicId) => {
    if (!window.confirm("Delete this topic and all its replies?")) {
      return;
    }

    deleteTopic(topicId);
  };

  const filteredTopics = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    let nextTopics = topics.filter((topic) =>
      topic.title.toLowerCase().includes(searchTerm)
    );

    if (filter === "mostLiked") {
      nextTopics = [...nextTopics].sort((a, b) => b.likes - a.likes);
    }

    if (filter === "unanswered") {
      nextTopics = nextTopics.filter((topic) => forumService.countReplies(topic.replies) === 0);
    }

    if (filter === "latest") {
      nextTopics = [...nextTopics].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return nextTopics;
  }, [filter, search, topics]);

  return (
    <section className="forum-page-shell">
      <div className="forum-toolbar">
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

        <button
          className="forum-btn forum-btn-primary forum-btn-icon"
          type="button"
          onClick={() => setIsCreateOpen(true)}
          title="Create topic"
          aria-label="Create topic"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="forum-topic-list">
        {filteredTopics.length === 0 ? (
          <div className="forum-empty-state">No discussions yet for this course.</div>
        ) : (
          filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onLike={likeTopic}
              isLiked={Boolean(topic.likedBy?.includes(currentUserId))}
              canManage={isAdmin}
              onDeleteTopic={handleDeleteTopic}
            />
          ))
        )}
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
