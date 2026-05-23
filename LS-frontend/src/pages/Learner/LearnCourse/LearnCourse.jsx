import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  MessageCircle, 
  Reply, 
  ThumbsUp, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  Compass 
} from "lucide-react";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import Skeleton from "../../../components/Skeleton/Skeleton.jsx";
import { useInitialLoadComplete } from "../../../components/GlobalNetworkLoader/InitialLoadContext.jsx";
import { useProgressiveReveal } from "../../../hooks/useProgressiveReveal";
import useForum from "../../../hooks/useForum";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getCourseLessons, getCoursesByIds } from "../../../services/courseApi";
import { getCourseProgress, getCourseQuizzesByCourseId, markLessonCompletedDb } from "../../../services/progressApi";
import { getAdminSettings } from "../../../services/adminApi";
import "./LearnCourse.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

const LESSON_PLACEHOLDER_COUNT = 5;

function WorkspaceSkeleton() {
  return (
    <div className="workspace-loading-state" aria-hidden="true">
      <Skeleton className="skeleton-badge" />
      <Skeleton className="skeleton-title" />
      <Skeleton className="skeleton-text" />
      <Skeleton className="skeleton-media" />
      <Skeleton className="skeleton-actions" />
    </div>
  );
}

function SidebarItemSkeleton() {
  return (
    <div className="sidebar-skeleton-item" aria-hidden="true">
      <Skeleton className="skeleton-dot" />
      <div className="skeleton-details">
        <Skeleton className="skeleton-eyebrow" />
        <Skeleton className="skeleton-label" />
      </div>
    </div>
  );
}

function LearnCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialLoadComplete = useInitialLoadComplete();

  const courseId = String(id);
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";
  const isAdminPreview =
    searchParams.get("adminPreview") === "true" && String(currentUser?.role || "").toLowerCase() === "admin";

  const [course, setCourse] = useState(null);
  const [openLessonIndex, setOpenLessonIndex] = useState(-1);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [expandedTopicId, setExpandedTopicId] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [composerText, setComposerText] = useState("");
  const [composerError, setComposerError] = useState("");
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [discussionEnabled, setDiscussionEnabled] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const isPageLoading = lessonsLoading || progressLoading;

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

  // Redirect to login if user session is missing
  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true, state: { from: `/student-layout/learn/${courseId}` } });
    }
  }, [courseId, navigate, userId]);

  // Load Admin settings (Discussions toggle)
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

  // Fetch Course details (Name, Instructor, Category) for Redesigned Header
  useEffect(() => {
    let active = true;
    async function loadCourseDetails() {
      try {
        const list = await getCoursesByIds([courseId]);
        if (!active) return;
        if (Array.isArray(list) && list.length > 0) {
          setCourse(list[0]);
        }
      } catch {
        // Fallback to null
      }
    }
    loadCourseDetails();
    return () => {
      active = false;
    };
  }, [courseId]);

  // Fetch Quizzes associated with this Course
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

  // Fetch all Course Lessons
  useEffect(() => {
    let active = true;
    async function loadLessons() {
      setLessonsLoading(true);
      try {
        const list = await getCourseLessons(courseId);
        if (!active) return;
        setCourseLessons(Array.isArray(list) ? list : []);
        // Automatically open the first uncompleted lesson if none is opened
        if (Array.isArray(list) && list.length > 0) {
          const completedIds = courseProgress?.completedLessonIds || [];
          const firstUncompletedIndex = list.findIndex(lesson => !completedIds.includes(String(lesson.id)));
          setOpenLessonIndex(firstUncompletedIndex >= 0 ? firstUncompletedIndex : 0);
        }
      } catch {
        if (!active) return;
        setCourseLessons([]);
      } finally {
        if (active) setLessonsLoading(false);
      }
    }
    loadLessons();
    return () => {
      active = false;
    };
  }, [courseId, courseProgress]);

  // Fetch Course Progress
  useEffect(() => {
    let active = true;
    async function loadProgress() {
      setProgressLoading(true);
      if (!userId) {
        if (active) setProgressLoading(false);
        return;
      }
      try {
        const progress = await getCourseProgress(userId, courseId);
        if (!active) return;
        setCourseProgress(progress || null);
      } catch {
        if (!active) return;
        setCourseProgress(null);
      } finally {
        if (active) setProgressLoading(false);
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
  };

  const getAuthorName = (topic) =>
    topic?.author || topic?.authorName || topic?.createdByName || topic?.userName || "Learner";

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

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const buildTopicTitle = (text) => {
    const compact = String(text || "").replace(/\s+/g, " ").trim();
    if (!compact) return "Course Discussion";
    if (compact.length <= 70) return compact;
    return `${compact.slice(0, 67)}...`;
  };

  const submitDiscussionComment = async () => {
    const text = String(composerText || "").trim();
    if (!text) {
      setComposerError("Write your discussion before commenting.");
      return;
    }

    setComposerError("");
    const result = await createTopic({
      title: buildTopicTitle(text),
      content: escapeHtml(text).replace(/\n/g, "<br/>"),
    });

    if (!result?.ok) {
      setComposerError(result?.error || "Unable to post discussion.");
      return;
    }

    setComposerText("");
    setComposerError("");
  };

  const renderLessonPanel = (lesson, index) => {
    const lessonDone = learningState.progress.completedLessonIds.includes(String(lesson.id));
    const lessonQuiz = getLessonQuiz(lesson.id);

    return (
      <div className="workspace-lesson-panel">
        <div className="panel-header">
          <span className="lesson-number-tag">LESSON {index + 1}</span>
          <h2>{lesson.title}</h2>
        </div>

        {lesson.description && (
          <div className="lesson-description-box">
            <p className="lesson-text">{lesson.description}</p>
          </div>
        )}

        {lesson.type === "video" && lesson.fileUrl && (
          <div className="lesson-media-wrapper video-wrapper">
            <video className="lesson-video" controls src={lesson.fileUrl} poster={courseImg}>
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {lesson.type === "pdf" && lesson.fileUrl && (
          <div className="lesson-media-wrapper pdf-wrapper">
            <iframe className="lesson-pdf" src={lesson.fileUrl} title={lesson.title} />
          </div>
        )}

        {lesson.fileUrl && lesson.type !== "video" && lesson.type !== "pdf" && (
          <div className="lesson-resource-download">
            <div className="resource-info">
              <FileText size={24} className="resource-icon" />
              <div>
                <strong>{lesson.fileName || "Study Material"}</strong>
                <span>Format: {String(lesson.type || "Resource").toUpperCase()}</span>
              </div>
            </div>
            <a className="lesson-download" href={lesson.fileUrl} target="_blank" rel="noreferrer">
              Open Material
            </a>
          </div>
        )}

        <div className="lesson-actions-toolbar">
          <button 
            className={`complete-lesson-btn ${lessonDone ? "done" : ""}`}
            onClick={() => handleCompleteLesson(lesson.id, index)} 
            disabled={lessonDone || isAdminPreview}
          >
            {lessonDone ? (
              <>
                <CheckCircle2 size={16} />
                <span>Lesson Completed</span>
              </>
            ) : (
              <span>Mark as Completed</span>
            )}
          </button>
          
          <button
            className="next-lesson-btn"
            onClick={() => setOpenLessonIndex(Math.min(index + 1, lessons.length - 1))}
            disabled={index === lessons.length - 1}
          >
            <span>Next Lesson</span>
          </button>
        </div>

        {/* Lesson Quiz Integration */}
        <div className="lesson-assessment-card">
          <div className="assessment-card-header">
            <Trophy size={18} className="gold-icon" />
            <div>
              <h3>Lesson Assessment</h3>
              <p>Test your understanding of the materials covered in this lesson.</p>
            </div>
          </div>
          <button
            className="assessment-action-btn"
            disabled={!lessonDone || !lessonQuiz || loadingQuiz || isAdminPreview}
            onClick={() =>
              navigate(
                `/student-layout/test/${courseId}?mode=lesson&lessonId=${encodeURIComponent(String(lesson.id))}&lessonIndex=${index}`
              )
            }
          >
            {!lessonQuiz 
              ? "Assessment unavailable" 
              : lessonDone 
                ? "Start Lesson Assessment" 
                : "Complete lesson to unlock exam"}
          </button>
        </div>
      </div>
    );
  };

  const renderDiscussionPanel = () => {
    if (!discussionEnabled) {
      return (
        <div className="workspace-discussion-disabled">
          <Compass size={40} />
          <h3>Discussion Board Closed</h3>
          <p>Discussions are currently disabled for this course by the administrator.</p>
        </div>
      );
    }

    return (
      <div className="workspace-discussion-panel">
        <div className="panel-header">
          <span className="discussion-badge">COMMUNITY FORUM</span>
          <h2>Course Discussion Board</h2>
          <p>Engage with fellow learners, collaborate on course topics, and ask questions.</p>
        </div>

        <div className="discussion-composer-card">
          <div className="composer-header">
            <MessageCircle size={18} className="purple-icon" />
            <h3>Create a New Discussion Thread ({topics.length})</h3>
          </div>
          <textarea
            placeholder="Share an insight, ask a question, or discuss lessons..."
            value={composerText}
            onChange={(e) => {
              setComposerText(e.target.value);
              if (composerError) setComposerError("");
            }}
            disabled={isAdminPreview}
          />
          {composerError && <p className="composer-error-msg">{composerError}</p>}
          <div className="composer-actions">
            <button
              className="submit-comment-btn"
              onClick={submitDiscussionComment}
              disabled={isAdminPreview || !String(composerText || "").trim()}
            >
              Post to Forum
            </button>
          </div>
        </div>

        <div className="discussion-rules-banner">
          <div className="rules-header">
            <Sparkles size={14} className="gold-icon" />
            <span>Community Code of Conduct</span>
          </div>
          <p>Be respectful and supportive. Share hints and explanations, but avoid publishing direct exam answers.</p>
        </div>

        <div className="discussion-threads-scrollable">
          {loading && <p className="loading-threads-text">Loading discussions...</p>}
          {error && <p className="error-threads-text">{error}</p>}
          {!loading && topics.length === 0 && (
            <div className="empty-threads-state">
              <MessageCircle size={32} />
              <p>No discussion threads have been created yet.</p>
              <small>Be the first to ask a question or start a topic!</small>
            </div>
          )}
          
          {topics.map((topic) => {
            const topicId = String(topic.id);
            const isExpanded = topicId === String(expandedTopicId);
            const replies = isExpanded && activeThread ? activeThread.replies || [] : [];
            const repliesCount = countReplies(topic.replies || []) || topic.replyCount || 0;
            return (
              <div key={topic.id} className="forum-thread-card">
                <div className="thread-avatar-col">
                  <div className="user-avatar-initial">
                    {String(getAuthorName(topic)).slice(0, 1).toUpperCase()}
                  </div>
                </div>
                <div className="thread-content-col">
                  <div className="thread-meta-row">
                    <strong>{getAuthorName(topic)}</strong>
                    <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="thread-body-text" dangerouslySetInnerHTML={{ __html: topic.content }} />
                  
                  <div className="thread-actions-toolbar">
                    <button className="like-btn" onClick={() => likeTopic(topic.id)} disabled={isAdminPreview}>
                      <ThumbsUp size={13} />
                      <span>{topic.likes || 0} Likes</span>
                    </button>
                    <button className="replies-toggle-btn" onClick={() => toggleTopicReplies(topic.id)}>
                      <MessageCircle size={13} />
                      <span>{isExpanded ? "Hide Replies" : `${repliesCount} Replies`}</span>
                    </button>
                    <button 
                      className="reply-trigger-btn"
                      onClick={() => setReplyDrafts((prev) => ({ ...prev, [topicId]: prev[topicId] || "" }))}
                    >
                      <Reply size={13} />
                      <span>Reply</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="nested-replies-container">
                      {replies.map((reply) => (
                        <div key={reply.id} className="nested-reply-card">
                          <div className="reply-avatar">
                            {String(reply.authorName || reply.createdByName || "R").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="reply-content">
                            <div className="reply-meta">
                              <strong>{reply.author || reply.authorName || reply.createdByName || "Learner"}</strong>
                              <span>{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                            <p className="reply-text" dangerouslySetInnerHTML={{ __html: reply.content || "" }} />
                          </div>
                        </div>
                      ))}

                      {/* Reply Input Grid */}
                      <div className="reply-input-bar">
                        <div className="reply-avatar mini">
                          {String(currentUser?.name || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <input
                          type="text"
                          placeholder="Write a supportive reply..."
                          value={replyDrafts[topicId] || ""}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [topicId]: e.target.value }))}
                          disabled={isAdminPreview}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isAdminPreview && String(replyDrafts[topicId] || "").trim()) {
                              submitInlineReply(topic.id);
                            }
                          }}
                        />
                      </div>
                      <div className="reply-input-actions">
                        <button className="cancel-reply-btn" onClick={() => setReplyDrafts((prev) => ({ ...prev, [topicId]: "" }))}>Cancel</button>
                        <button 
                          className="submit-reply-btn" 
                          onClick={() => submitInlineReply(topic.id)} 
                          disabled={isAdminPreview || !String(replyDrafts[topicId] || "").trim()}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (isPageLoading) {
      return <WorkspaceSkeleton />;
    }

    if (isDiscussionOpen) {
      return renderDiscussionPanel();
    }

    if (openLessonIndex === -2) {
      return (
        <div className="workspace-final-exam-panel">
          <div className="panel-header">
            <span className="exam-badge">ACADEMIC CAPSTONE</span>
            <h2>Final Course Assessment</h2>
            <p>Prove your mastery of the entire syllabus to earn your verifiable LearnSphere Certificate.</p>
          </div>

          <div className="exam-details-card">
            <Trophy size={48} className="trophy-glow" />
            <h3>Verifiable Certificate Capstone</h3>
            <p>You have unlocked the final exam by completing all lessons in this curriculum. Ensure you are well prepared before starting the assessment.</p>
            
            <div className="exam-rules-list">
              <h4>Exam Guidelines:</h4>
              <ul>
                <li>Must score a passing grade to unlock the digital certificate.</li>
                <li>Ensure a stable network connection before starting.</li>
                <li>All submissions are final and recorded on your official transcript.</li>
              </ul>
            </div>

            <button 
              className="start-final-exam-btn" 
              onClick={() => navigate(`/student-layout/test/${courseId}?mode=final`)}
              disabled={isAdminPreview}
            >
              Start Final Assessment
            </button>
          </div>
        </div>
      );
    }

    if (openLessonIndex >= 0 && openLessonIndex < lessons.length) {
      const activeLesson = lessons[openLessonIndex];
      return renderLessonPanel(activeLesson, openLessonIndex);
    }

    // Default welcome/empty state
    return (
      <div className="workspace-welcome-state">
        <Compass size={48} className="welcome-icon" />
        <h2>Welcome to your Learning Workspace</h2>
        <p>Select any unlocked lesson from the navigation menu on the right to start studying, watching video lessons, or downloading resources.</p>
        
        {learningState.progressPercentage === 100 && finalQuiz && (
          <div className="welcome-final-call">
            <Trophy size={32} className="trophy-glow" />
            <h3>Congratulations! You've finished all lessons.</h3>
            <p>Unlock your verifiable course credential by passing the final exam.</p>
            <button className="start-final-btn" onClick={() => navigate(`/student-layout/test/${courseId}?mode=final`)}>
              Start Final Assessment
            </button>
          </div>
        )}
      </div>
    );
  };

  const isPageEmpty = !isPageLoading && !lessons.length;

  if (isPageEmpty) {
    return (
      <div className="learn-empty">
        <Compass size={48} className="empty-icon" />
        <h3>No lessons available yet</h3>
        <p>This course has no uploaded lessons at the moment. Please check back later.</p>
        <button className="back-home-btn" onClick={() => navigate("/student-layout/my-courses")}>
          <ArrowLeft size={15} />
          <span>Back to My Courses</span>
        </button>
      </div>
    );
  }

  return (
    <div className="learn-page">
      {/* 1. Immersive Course Hero Header */}
      <header className="learn-course-hero">
        <div className="hero-top-nav">
          <button className="back-to-courses-btn" onClick={() => navigate("/student-layout/my-courses")}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          {course?.category && (
            <span className="course-category-badge">{course.category}</span>
          )}
        </div>

        <div className="hero-content-wrap">
          <div className="hero-details">
            <span className="hero-eyebrow"><Sparkles size={13} /> COURSE WORKSPACE</span>
            <h1>{course?.courseName || "Loading Course Workspace..."}</h1>
            <p className="instructor-sub">Authorized by <strong>{course?.instructor || "LearnSphere Faculty"}</strong></p>
          </div>

          <div className="hero-progress-hub">
            <div className="progress-stats-row">
              <span>Overall Completion</span>
              <strong>{learningState.progressPercentage}%</strong>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${learningState.progressPercentage}%` }} 
              />
            </div>
            <span className="progress-ratio-sub">
              {completedCount} of {lessons.length} lessons mastered
            </span>
          </div>
        </div>
      </header>

      {/* 2. Interactive Workspace & Navigation Sidebar grid */}
      <div className="learn-content-grid">
        <main className="learn-main-workspace">
          {renderMainContent()}
        </main>

        <aside className="learn-navigation-sidebar">
          <div className="sidebar-header">
            <BookOpen size={16} />
            <h3>Course Curriculum</h3>
          </div>

          <div className="sidebar-scrollable-menu">
            {isPageLoading ? (
              Array.from({ length: LESSON_PLACEHOLDER_COUNT }, (_, index) => (
                <SidebarItemSkeleton key={`sidebar-skeleton-${index}`} />
              ))
            ) : (
              <>
                {lessons.map((lesson, index) => {
                  const done = learningState.progress.completedLessonIds.includes(String(lesson.id));
                  const locked = !done && index > completedCount;
                  const isActive = openLessonIndex === index && !isDiscussionOpen;

                  return (
                    <button
                      key={`${lesson.id}-${index}`}
                      className={`sidebar-nav-item ${isActive ? "active" : ""} ${locked ? "locked" : ""}`}
                      disabled={locked}
                      onClick={() => {
                        if (locked) return;
                        setIsDiscussionOpen(false);
                        setExpandedTopicId("");
                        setOpenLessonIndex(index);
                      }}
                    >
                      <div className="item-status-icon">
                        {locked ? (
                          <Lock size={14} className="lock-icon" />
                        ) : done ? (
                          <CheckCircle2 size={16} className="check-icon" />
                        ) : (
                          <PlayCircle size={16} className="play-icon" />
                        )}
                      </div>
                      <div className="item-details">
                        <span className="lesson-index-sub">LESSON {index + 1}</span>
                        <strong className="lesson-title">{lesson.title}</strong>
                      </div>
                    </button>
                  );
                })}

                {/* Discussion Entry Button */}
                {discussionEnabled && (
                  <button
                    className={`sidebar-nav-item discussion-nav-item ${isDiscussionOpen ? "active" : ""}`}
                    onClick={() => {
                      setOpenLessonIndex(-1);
                      setIsDiscussionOpen(true);
                      setExpandedTopicId("");
                    }}
                  >
                    <div className="item-status-icon">
                      <MessageCircle size={16} className="discussion-icon" />
                    </div>
                    <div className="item-details">
                      <span className="lesson-index-sub">COMMUNITY FORUM</span>
                      <strong className="lesson-title">Course Discussion Board</strong>
                    </div>
                  </button>
                )}

                {/* Capstone Exam Entry Button */}
                {finalQuiz && (
                  <button
                    className={`sidebar-nav-item capstone-nav-item ${openLessonIndex === -2 ? "active" : ""} ${learningState.progressPercentage < 100 ? "locked" : ""}`}
                    disabled={learningState.progressPercentage < 100}
                    onClick={() => {
                      setOpenLessonIndex(-2);
                      setIsDiscussionOpen(false);
                      setExpandedTopicId("");
                    }}
                  >
                    <div className="item-status-icon">
                      <Trophy size={16} className="capstone-icon" />
                    </div>
                    <div className="item-details">
                      <span className="lesson-index-sub">ACADEMIC CAPSTONE</span>
                      <strong className="lesson-title">Final Course Assessment</strong>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default LearnCourse;
