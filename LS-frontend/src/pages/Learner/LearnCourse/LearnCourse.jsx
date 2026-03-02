import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Lock, MessageCircle, Reply, ThumbsUp } from "lucide-react";
import CreateTopicModal from "../../../forum/components/CreateTopicModal";
import useForum from "../../../forum/hooks/useForum";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getCourseLessons } from "../../../services/courseApi";
import { getCourseProgress, markLessonCompletedDb } from "../../../services/progressApi";
import { getCourseQuizzesByCourseId } from "../../../services/progressApi";
import { getAdminSettings } from "../../../services/adminApi";
import "./LearnCourse.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const courseId = String(id);
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";
  const isAdminPreview =
    searchParams.get("adminPreview") === "true" && String(currentUser?.role || "").toLowerCase() === "admin";

  const [openLessonIndex, setOpenLessonIndex] = useState(-1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [expandedTopicId, setExpandedTopicId] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [composerText, setComposerText] = useState("");
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [discussionEnabled, setDiscussionEnabled] = useState(true);

  const [courseLessons, setCourseLessons] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);

  const learningState = useMemo(
    () => buildCourseLearningStateFromApi(courseLessons, courseProgress),
    [courseLessons, courseProgress]
  );

  const lessons = learningState.lessons;
  const completedCount = learningState.progress.completedLessonIds.length;

  const {
    topics,
    loading,
    error,
    createTopic,
    likeTopic,
    fetchThreadById,
    threadDetail,
    addReply,
    countReplies,
  } = useForum(courseId, currentUser);

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true, state: { from: `/student-layout/learn/${courseId}` } });
    }
  }, [courseId, navigate, userId]);

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
    async function loadQuiz() {
      setLoadingQuiz(true);
      try {
        const quiz = await getCourseQuizzesByCourseId(courseId);
        if (!active) return;
        setCourseQuizzes(Array.isArray(quiz) ? quiz : []);
      } catch {
        if (!active) return;
        setCourseQuizzes([]);
      } finally {
        if (active) setLoadingQuiz(false);
      }
    }
    loadQuiz();
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    let active = true;
    async function loadLessons() {
      try {
        const list = await getCourseLessons(courseId);
        if (!active) return;
        setCourseLessons(Array.isArray(list) ? list : []);
      } catch {
        if (!active) return;
        setCourseLessons([]);
      }
    }
    loadLessons();
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    let active = true;
    async function loadProgress() {
      if (!userId) return;
      try {
        const progress = await getCourseProgress(userId, courseId);
        if (!active) return;
        setCourseProgress(progress || null);
      } catch {
        if (!active) return;
        setCourseProgress(null);
      }
    }
    loadProgress();
    return () => {
      active = false;
    };
  }, [courseId, userId]);

  useEffect(() => {
    if (!expandedTopicId) return;
    fetchThreadById(expandedTopicId, 0, false);
  }, [expandedTopicId, fetchThreadById]);

  const finalQuiz = useMemo(
    () => courseQuizzes.find((quiz) => String(quiz.assessmentType || "FINAL").toUpperCase() === "FINAL") || null,
    [courseQuizzes]
  );

  const getLessonQuiz = (lessonId) =>
    courseQuizzes.find(
      (quiz) =>
        String(quiz.assessmentType || "").toUpperCase() === "LESSON" &&
        String(quiz.lessonId || "") === String(lessonId || "")
    ) || null;

  const handleCompleteLesson = (lessonId, index) => {
    markLessonCompletedDb(userId, courseId, lessonId)
      .then((progress) => setCourseProgress(progress || null))
      .catch(() => null);
    setOpenLessonIndex(Math.min(index + 1, lessons.length - 1));
  };

  const getAuthorName = (topic) => topic?.authorName || topic?.createdByName || topic?.userName || "Learner";

  const toggleTopicReplies = (topicId) => {
    setExpandedTopicId((prev) => (String(prev) === String(topicId) ? "" : String(topicId)));
  };

  const activeThread =
    expandedTopicId && threadDetail && String(threadDetail.id || "") === String(expandedTopicId)
      ? threadDetail
      : null;

  const submitInlineReply = async (topicId) => {
    const text = String(replyDrafts[topicId] || "").trim();
    if (!text) return;
    const result = await addReply(topicId, { content: text });
    if (result?.ok) {
      setReplyDrafts((prev) => ({ ...prev, [topicId]: "" }));
      fetchThreadById(topicId, 0, false);
    }
  };

  const renderLessonPanel = (lesson, index) => {
    const lessonDone = learningState.progress.completedLessonIds.includes(String(lesson.id));
    const lessonQuiz = getLessonQuiz(lesson.id);

    return (
      <div className="lesson-panel" key={`panel-${lesson.id}-${index}`}>
        {lesson.description ? <p className="lesson-text">{lesson.description}</p> : null}

        {lesson.type === "video" && lesson.fileUrl ? (
          <video className="lesson-video" controls src={lesson.fileUrl}>
            Your browser does not support video playback.
          </video>
        ) : null}

        {lesson.type === "pdf" && lesson.fileUrl ? (
          <iframe className="lesson-pdf" src={lesson.fileUrl} title={lesson.title} />
        ) : null}

        {lesson.fileUrl && lesson.type !== "video" && lesson.type !== "pdf" ? (
          <a className="lesson-download" href={lesson.fileUrl} target="_blank" rel="noreferrer">
            Open {lesson.fileName || "Material"}
          </a>
        ) : null}

        <div className="lesson-actions-row">
          <button onClick={() => handleCompleteLesson(lesson.id, index)} disabled={lessonDone || isAdminPreview}>
            {lessonDone ? "Lesson Completed" : "Mark as Completed"}
          </button>
          <button onClick={() => setOpenLessonIndex(Math.min(index + 1, lessons.length - 1))} disabled={index === lessons.length - 1}>
            Next Lesson
          </button>
        </div>

        <div className="lesson-assessment-card">
          <h3>Lesson Assessment</h3>
          <button
            disabled={!lessonDone || !lessonQuiz || loadingQuiz || isAdminPreview}
            onClick={() =>
              navigate(
                `/student-layout/test/${courseId}?mode=lesson&lessonId=${encodeURIComponent(String(lesson.id))}&lessonIndex=${index}`
              )
            }
          >
            {!lessonQuiz ? "Assessment unavailable" : lessonDone ? "Start Lesson Assessment" : "Complete lesson to unlock"}
          </button>
        </div>
      </div>
    );
  };

  const renderDiscussionPanel = () => {
    if (!discussionEnabled) {
      return <div className="discussion-meta">Discussion is disabled by admin.</div>;
    }

    return (
      <div className="discussion-board">
        <div className="discussion-compose">
          <div className="discussion-compose-head">
            <h3>
              <MessageCircle size={17} /> Discussion ({topics.length})
            </h3>
          </div>
          <textarea
            placeholder="Type comment here..."
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            disabled={isAdminPreview}
          />
          <div className="discussion-compose-actions">
            <button
              onClick={() => setIsCreateOpen(true)}
              disabled={isAdminPreview}
            >
              Comment
            </button>
          </div>
        </div>

        <div className="discussion-rules">
          <h4>Discussion Rules</h4>
          <p>1. Keep the discussion helpful and respectful.</p>
          <p>2. Ask doubts or share hints. Avoid posting direct solutions.</p>
        </div>

        <div className="discussion-thread-list">
          {loading ? <p className="discussion-meta">Loading discussions...</p> : null}
          {error ? <p className="discussion-meta">{error}</p> : null}
          {!loading && topics.length === 0 ? <div className="discussion-meta">No discussions yet. Start one.</div> : null}
          {topics.map((topic) => {
            const topicId = String(topic.id);
            const isExpanded = topicId === String(expandedTopicId);
            const replies = isExpanded && activeThread ? activeThread.replies || [] : [];
            const repliesCount = countReplies(topic.replies || []) || topic.replyCount || 0;
            return (
              <div key={topic.id} className="discussion-thread-card">
                <div className="discussion-author-dot">{String(getAuthorName(topic)).slice(0, 1).toUpperCase()}</div>
                <div className="discussion-thread-main">
                  <div className="discussion-thread-head">
                    <strong>{getAuthorName(topic)}</strong>
                    <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4>{topic.title}</h4>
                  <p className="discussion-thread-preview" dangerouslySetInnerHTML={{ __html: topic.content }} />
                  <div className="discussion-thread-actions">
                    <button onClick={() => likeTopic(topic.id)} disabled={isAdminPreview}>
                      <ThumbsUp size={14} /> {topic.likes || 0}
                    </button>
                    <button onClick={() => toggleTopicReplies(topic.id)}>
                      <MessageCircle size={14} /> {isExpanded ? "Hide Replies" : `Show ${repliesCount} Replies`}
                    </button>
                    <button onClick={() => setReplyDrafts((prev) => ({ ...prev, [topicId]: prev[topicId] || "" }))}>
                      <Reply size={14} /> Reply
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="discussion-replies-wrap">
                      {replies.map((reply) => (
                        <div key={reply.id} className="discussion-reply-card">
                          <div className="discussion-author-dot small">
                            {String(reply.authorName || reply.createdByName || "R").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="discussion-reply-main">
                            <div className="discussion-thread-head">
                              <strong>{reply.authorName || reply.createdByName || "Learner"}</strong>
                              <span>{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                            <p dangerouslySetInnerHTML={{ __html: reply.content || "" }} />
                          </div>
                        </div>
                      ))}

                      <div className="discussion-reply-input-row">
                        <div className="discussion-author-dot small">{String(currentUser?.name || "U").slice(0, 1).toUpperCase()}</div>
                        <input
                          type="text"
                          placeholder="Type reply here..."
                          value={replyDrafts[topicId] || ""}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [topicId]: e.target.value }))}
                          disabled={isAdminPreview}
                        />
                      </div>
                      <div className="discussion-reply-input-actions">
                        <button className="cancel" onClick={() => setReplyDrafts((prev) => ({ ...prev, [topicId]: "" }))}>Cancel</button>
                        <button className="reply" onClick={() => submitInlineReply(topic.id)} disabled={isAdminPreview || !String(replyDrafts[topicId] || "").trim()}>
                          Reply
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <CreateTopicModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={async (payload) => {
            const fallbackTitle = "Course Discussion";
            const content = String(composerText || "").trim();
            const result = await createTopic({
              ...payload,
              title: payload?.title || fallbackTitle,
              content: payload?.content || content,
            });
            if (result?.ok) {
              setIsCreateOpen(false);
              setComposerText("");
            }
            return result;
          }}
        />
      </div>
    );
  };

  if (!lessons.length) {
    return (
      <div className="learn-empty">
        <h3>No lessons available yet</h3>
        <p>This course has no uploaded lessons at the moment.</p>
        <button onClick={() => navigate("/student-layout/my-courses")}>Back to My Courses</button>
      </div>
    );
  }

  return (
    <div className="learn-page">
      <div className="learn-content">
        <div className="lesson-accordion-list">
          {lessons.map((lesson, index) => {
            const done = learningState.progress.completedLessonIds.includes(String(lesson.id));
            const locked = !done && index > completedCount;
            const opened = openLessonIndex === index;
            return (
              <div key={`${lesson.id}-${index}`} className={`lesson-accordion-item ${opened ? "open" : ""}`}>
                <button
                  className="lesson-accordion-title"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    setIsDiscussionOpen(false);
                    setExpandedTopicId("");
                    setOpenLessonIndex((prev) => (prev === index ? -1 : index));
                  }}
                >
                  <span className="lesson-title-only">{lesson.title}</span>
                  <span className="lesson-title-icons">
                    {locked ? <Lock size={14} /> : null}
                    {opened ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {opened ? renderLessonPanel(lesson, index) : null}
              </div>
            );
          })}

          {discussionEnabled && (
            <div className="lesson-accordion-item discussion-entry-item">
              <button
                className="lesson-accordion-title discussion-entry"
                onClick={() => {
                  setOpenLessonIndex(-1);
                  setIsDiscussionOpen((prev) => !prev);
                  setExpandedTopicId("");
                }}
              >
                <span className="lesson-title-only">Course Discussion</span>
                <span className="lesson-title-icons">
                  <MessageCircle size={17} />
                </span>
              </button>
              {isDiscussionOpen ? renderDiscussionPanel() : null}
            </div>
          )}
        </div>

        <div className="final-assessment-card">
          <h3>Final Course Assessment</h3>
          <button
            disabled={learningState.progressPercentage < 100 || !finalQuiz || loadingQuiz || isAdminPreview}
            onClick={() => navigate(`/student-layout/test/${courseId}?mode=final`)}
          >
            {learningState.progressPercentage < 100 ? "Finish all lessons to unlock" : "Start Final Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LearnCourse;
