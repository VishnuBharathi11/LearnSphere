import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CreateTopicModal from "../../../forum/components/CreateTopicModal";
import ReplyBox from "../../../forum/components/ReplyBox";
import ReplyItem from "../../../forum/components/ReplyItem";
import useForum from "../../../forum/hooks/useForum";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getCourseLessons } from "../../../services/courseApi";
import {
  getCourseProgress,
  markLessonCompletedDb,
} from "../../../services/progressApi";
import { getCourseQuizzesByCourseId } from "../../../services/progressApi";
import { getAdminSettings } from "../../../services/adminApi";
import "./LearnCourse.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const courseId = String(id);
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";
  const isAdminPreview = searchParams.get("adminPreview") === "true" && String(currentUser?.role || "").toLowerCase() === "admin";

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "discussion" ? "discussion" : "learn");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(searchParams.get("threadId") || "");
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
  const activeLesson = lessons[currentIndex];
  const currentLessonDone = activeLesson
    ? learningState.progress.completedLessonIds.includes(String(activeLesson.id))
    : false;

  const {
    topics,
    loading,
    error,
    createTopic,
    likeTopic,
    fetchThreadById,
    threadDetail,
    addReply,
    voteReply,
    reportReply,
    replyMeta,
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
    if (!discussionEnabled && activeTab === "discussion") {
      setActiveTab("learn");
    }
  }, [discussionEnabled, activeTab]);

  useEffect(() => {
    if (!selectedThreadId) return;
    fetchThreadById(selectedThreadId, 0, false);
  }, [fetchThreadById, selectedThreadId]);

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
    if (currentIndex >= lessons.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, lessons.length]);

  const finalQuiz = useMemo(
    () => courseQuizzes.find((quiz) => String(quiz.assessmentType || "FINAL").toUpperCase() === "FINAL") || null,
    [courseQuizzes]
  );
  const lessonQuiz = useMemo(
    () =>
      courseQuizzes.find(
        (quiz) =>
          String(quiz.assessmentType || "").toUpperCase() === "LESSON" &&
          String(quiz.lessonId || "") === String(activeLesson?.id || "")
      ) || null,
    [courseQuizzes, activeLesson?.id]
  );

  const openDiscussionTab = (threadId = "") => {
    setActiveTab("discussion");
    const next = new URLSearchParams(searchParams);
    next.set("tab", "discussion");
    if (threadId) {
      next.set("threadId", String(threadId));
      setSelectedThreadId(String(threadId));
    }
    setSearchParams(next, { replace: true });
  };

  const handleCompleteLesson = () => {
    if (!activeLesson) return;
    markLessonCompletedDb(userId, courseId, activeLesson.id)
      .then((progress) => setCourseProgress(progress || null))
      .catch(() => null);
    const next = Math.min(currentIndex + 1, lessons.length - 1);
    setCurrentIndex(next);
  };

  const renderLessonContent = () => {
    if (!activeLesson) return null;

    const heading = activeLesson.heading || activeLesson.title || "Lesson";
    const subheading =
      (Array.isArray(activeLesson.subheadings) && activeLesson.subheadings.length > 0
        ? activeLesson.subheadings.join(" • ")
        : activeLesson.subheading) ||
      (activeLesson.type ? `${String(activeLesson.type).toUpperCase()} lesson` : "Theory module");

    return (
      <div className="lesson-renderer">
        <h2>{heading}</h2>
        <h4>{subheading}</h4>

        {activeLesson.description ? <p className="lesson-text">{activeLesson.description}</p> : null}

        {activeLesson.type === "video" && activeLesson.fileUrl ? (
          <video className="lesson-video" controls src={activeLesson.fileUrl}>
            Your browser does not support video playback.
          </video>
        ) : null}

        {activeLesson.type === "pdf" && activeLesson.fileUrl ? (
          <iframe className="lesson-pdf" src={activeLesson.fileUrl} title={activeLesson.title} />
        ) : null}

        {activeLesson.fileUrl && activeLesson.type !== "video" && activeLesson.type !== "pdf" ? (
          <a className="lesson-download" href={activeLesson.fileUrl} target="_blank" rel="noreferrer">
            Open {activeLesson.fileName || "Material"}
          </a>
        ) : null}
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
      <div className="learn-sidebar">
        <h3>Lessons</h3>
        {lessons.map((lesson, index) => {
          const done = learningState.progress.completedLessonIds.includes(String(lesson.id));
          return (
            <div
              key={`${lesson.id}-${index}`}
              className={index === currentIndex ? "lesson active" : "lesson"}
              onClick={() => {
                setCurrentIndex(index);
                setActiveTab("learn");
              }}
            >
              <span>{lesson.title}</span>
              {done ? <span className="lesson-check">Done</span> : null}
            </div>
          );
        })}
      </div>

      <div className="learn-content">
        <div className="learn-tabs">
          <button className={activeTab === "learn" ? "active" : ""} onClick={() => setActiveTab("learn")}>
            Continue Learning
          </button>
          {discussionEnabled && (
            <button
              className={activeTab === "discussion" ? "active" : ""}
              onClick={() => openDiscussionTab(selectedThreadId)}
            >
              Course Discussion
            </button>
          )}
        </div>

        {activeTab === "learn" ? (
          <>
            {renderLessonContent()}

            <div className="lesson-actions-row">
              <button onClick={handleCompleteLesson} disabled={currentLessonDone || isAdminPreview}>
                {currentLessonDone ? "Lesson Completed" : "Mark as Completed"}
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, lessons.length - 1))}
                disabled={currentIndex === lessons.length - 1}
              >
                Next Lesson
              </button>
            </div>

            <div className="lesson-assessment-card">
              <h3>Lesson Assessment</h3>
              <p>Unlocks after this lesson is completed.</p>
              <button
                disabled={!currentLessonDone || !lessonQuiz || loadingQuiz || isAdminPreview}
                onClick={() =>
                  navigate(
                    `/student-layout/test/${courseId}?mode=lesson&lessonId=${encodeURIComponent(
                      String(activeLesson.id)
                    )}&lessonIndex=${currentIndex}`
                  )
                }
              >
                {!lessonQuiz
                  ? "Assessment unavailable"
                  : currentLessonDone
                    ? "Start Lesson Assessment"
                    : "Complete lesson to unlock"}
              </button>
            </div>

            <div className="lesson-assessment-card">
              <h3>Final Course Assessment</h3>
              <p>Unlocks only when all lessons are completed.</p>
              <button
                disabled={learningState.progressPercentage < 100 || !finalQuiz || loadingQuiz || isAdminPreview}
                onClick={() => navigate(`/student-layout/test/${courseId}?mode=final`)}
              >
                {learningState.progressPercentage < 100 ? "Finish all lessons to unlock" : "Start Final Assessment"}
              </button>
            </div>
          </>
        ) : (
          <div className="learn-discussion-wrap">
            <div className="learn-discussion-head">
              <h3>Discussion for this course</h3>
              <button onClick={() => setIsCreateOpen(true)} disabled={isAdminPreview || !discussionEnabled}>
                Ask Question
              </button>
            </div>

            {loading ? <p>Loading discussions...</p> : null}
            {error ? <p className="forum-error">{error}</p> : null}

            {!selectedThreadId ? (
              <div className="forum-topic-list">
                {topics.length === 0 ? (
                  <div className="forum-empty-state">No discussions yet. Start one.</div>
                ) : (
                  topics.map((topic) => (
                    <div key={topic.id} className="forum-topic-card">
                      <button className="topic-inline-link" onClick={() => openDiscussionTab(topic.id)}>
                        <h4>{topic.title}</h4>
                      </button>
                      <p className="forum-topic-preview" dangerouslySetInnerHTML={{ __html: topic.content }} />
                      <div className="forum-meta-row">
                        <span className="forum-pill">{new Date(topic.createdAt).toLocaleString()}</span>
                        <span className="forum-pill forum-pill-accent">{countReplies(topic.replies || []) || topic.replyCount || 0} replies</span>
                      </div>
                      <button className="forum-like-icon-btn" onClick={() => likeTopic(topic.id)} disabled={isAdminPreview}>
                        Upvote {topic.likes || 0}
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="learn-thread-view">
                <button onClick={() => openDiscussionTab("")}>Back to discussions</button>
                {threadDetail ? (
                  <>
                    <h4>{threadDetail.title}</h4>
                    <p className="forum-topic-preview" dangerouslySetInnerHTML={{ __html: threadDetail.content }} />

                    {!threadDetail.isLocked && !isAdminPreview ? (
                      <ReplyBox
                        onSubmit={(content) => addReply(threadDetail.id, { content })}
                        placeholder="Share your answer..."
                        buttonLabel="Reply"
                      />
                    ) : (
                      <div className="forum-empty-state">{threadDetail.isLocked ? "Thread is locked." : "Admin preview is read-only."}</div>
                    )}

                    <div className="forum-replies-list">
                      {(threadDetail.replies || []).map((reply) => (
                        <ReplyItem
                          key={reply.id}
                          reply={reply}
                          topicId={threadDetail.id}
                          onVoteReply={voteReply}
                          onReply={addReply}
                          onReportReply={reportReply}
                          currentUserId={String(userId)}
                        />
                      ))}
                    </div>

                    {Number(replyMeta.page || 0) + 1 < Number(replyMeta.totalPages || 0) ? (
                      <button onClick={() => fetchThreadById(threadDetail.id, replyMeta.page + 1, true)}>
                        Load More Replies
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p>Loading thread...</p>
                )}
              </div>
            )}

            <CreateTopicModal
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onCreate={async (payload) => {
                const result = await createTopic(payload);
                if (result?.ok) {
                  setIsCreateOpen(false);
                }
                return result;
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LearnCourse;

