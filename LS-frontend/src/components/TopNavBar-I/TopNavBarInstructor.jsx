import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiEdit3, FiTrash2, FiX } from "react-icons/fi";
import { getNotifications, markNotificationRead } from "../../services/discussionApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getInstructorCourses } from "../../services/courseApi";
import { getEnrollmentsByCourses } from "../../services/enrollmentApi";
import {
  getLocalNotificationsByUser,
  markAllLocalNotificationsRead,
  markLocalNotificationRead,
  pushLocalNotification,
} from "../../services/activityNotificationStore";
import "./TopNavBarInstructor.scss";

function formatRelativeTime(dateValue) {
  if (!dateValue) return "just now";
  const now = Date.now();
  const then = new Date(dateValue).getTime();
  if (Number.isNaN(then)) return "just now";
  const diffSec = Math.max(1, Math.floor((now - then) / 1000));
  if (diffSec < 60) return `${diffSec} secs ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min} mins ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}

function buildDiscussionMessage(item) {
  const rawActor =
    item?.actorName ||
    item?.authorName ||
    item?.replyAuthorName ||
    item?.createdByName ||
    "";
  const actorText = String(rawActor || "").trim();
  const actor =
    !actorText ||
    /^\d+$/.test(actorText) ||
    /^learner\s*#?\d+$/i.test(actorText) ||
    /^user\s*#?\d+$/i.test(actorText)
      ? ""
      : actorText;
  const topicTitle = item?.threadTitle || item?.topicTitle || "";
  const type = String(item?.type || item?.notificationType || "").toLowerCase();
  const message = String(item?.message || "").trim();
  if (message) return message;

  if (type.includes("reply")) {
    if (actor && topicTitle) return `${actor} replied on "${topicTitle}".`;
    if (actor) return `${actor} replied on your course thread.`;
    return "A learner posted a new reply in your course thread.";
  }

  if (type.includes("question") || type.includes("thread")) {
    if (actor && topicTitle) return `${actor} asked: "${topicTitle}".`;
    if (actor) return `${actor} asked a new question in your course discussion.`;
    return "A new learner question was posted in your course discussion.";
  }

  return "You have a new discussion update.";
}

const PAGE_MAP = {
  "/instructor-layout/dashboard": {
    title: "Instructor Dashboard",
    subtitle: "Overview of your activity and learner engagement",
  },
  "/instructor-layout/create-course": {
    title: "Create Course",
    subtitle: "Build a course and send it for admin review",
  },
  "/instructor-layout/manage-courses": {
    title: "Manage Courses",
    subtitle: "Track course status, updates, and performance",
  },
  "/instructor-layout/profile": {
    title: "My Profile",
    subtitle: "Update your public instructor profile",
  },
};

function resolvePageMeta(pathname) {
  if (pathname.includes("/manage-courses/") && pathname.includes("/lessons")) {
    return { title: "Upload Lesson", subtitle: "Add and organize course lessons" };
  }
  if (pathname.includes("/manage-courses/") && pathname.includes("/quiz")) {
    return { title: "Create Quiz", subtitle: "Create lesson-wise and final assessments" };
  }
  if (pathname.includes("/manage-courses/") && pathname.includes("/students")) {
    return { title: "Students", subtitle: "View enrolled learners and progress" };
  }
  if (pathname.includes("/manage-courses/") && pathname.includes("/analytics")) {
    return { title: "Analytics", subtitle: "Measure course engagement and outcomes" };
  }
  if (pathname.includes("/edit-course/")) {
    return { title: "Edit Course", subtitle: "Update course details before review/publishing" };
  }
  if (pathname.includes("/forum/topic/") || (pathname.includes("/courses/") && pathname.endsWith("/forum"))) {
    return { title: "Course Discussion", subtitle: "Answer learner questions in your course forum" };
  }
  return (
    PAGE_MAP[pathname] || {
      title: "Instructor Dashboard",
      subtitle: "Overview of your activity and learner engagement",
    }
  );
}

function TopNavBarInstructor() {
  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const pageMeta = resolvePageMeta(location.pathname);
  const searchParams = new URLSearchParams(location.search);
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewUserName = searchParams.get("adminUserName") || "";
  const previewUserEmail = searchParams.get("adminUserEmail") || "";
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useCurrentUser();

  const displayName = isAdminPreview
    ? previewUserName || "Instructor"
    : currentUser?.name || currentUser?.username || "Instructor";
  const displayEmail = isAdminPreview
    ? previewUserEmail || "instructor@learnsphere.com"
    : currentUser?.email || "instructor@learnsphere.com";
  const userId = currentUser?.id || currentUser?.userId ? String(currentUser.id || currentUser.userId) : "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fetchNotifications = useMemo(
    () => async () => {
      if (isAdminPreview) {
        setNotifications([]);
        return;
      }

      if (!userId) return;

      try {
        const [discussionList, localList] = await Promise.all([
          getNotifications(userId),
          Promise.resolve(getLocalNotificationsByUser(userId, "instructor")),
        ]);

        const discussionNotifications = (discussionList || []).map((item) => ({
          id: `d-${item.id}`,
          source: "api",
          sourceId: item.id,
          title: item.title || "New discussion update",
          message: buildDiscussionMessage(item),
          rank: item.createdAt ? new Date(item.createdAt).getTime() : Number(item.id) || 0,
          courseId: item.courseId || "",
          threadId: item.threadId || "",
          targetPath: "",
          read: Boolean(item.read),
          createdAt: item.createdAt,
        }));

        const localNotifications = (Array.isArray(localList) ? localList : []).map((item) => ({
          ...item,
          source: "local",
          rank: item.createdAt ? new Date(item.createdAt).getTime() : 0,
        }));

        const storageKey = `cleared_notifications_${userId}`;
        const clearedIds = JSON.parse(localStorage.getItem(storageKey) || "[]");

        const merged = [...localNotifications, ...discussionNotifications]
          .filter((item) => !clearedIds.includes(String(item.id)))
          .sort((a, b) => b.rank - a.rank)
          .slice(0, 12);

        setNotifications(merged);
      } catch {
        const storageKey = `cleared_notifications_${userId}`;
        const clearedIds = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setNotifications(
          getLocalNotificationsByUser(userId, "instructor")
            .filter((item) => !clearedIds.includes(String(item.id)))
            .slice(0, 12)
        );
      }
    },
    [userId, isAdminPreview]
  );

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    if (isAdminPreview || !userId) return;

    let active = true;
    const syncEnrollmentNotifications = async () => {
      try {
        const instructorCourses = await getInstructorCourses(userId, 0, 120);
        if (!active) return;
        const courses = Array.isArray(instructorCourses) ? instructorCourses : [];
        if (courses.length === 0) return;
        const courseMap = new Map(courses.map((course) => [String(course.id), course]));
        const enrollments = await getEnrollmentsByCourses(Array.from(courseMap.keys()));
        if (!active) return;

        (Array.isArray(enrollments) ? enrollments : []).forEach((enrollment) => {
          const course = courseMap.get(String(enrollment.courseId));
          if (!course) return;
          const learnerRaw =
            String(
              enrollment.learnerName ||
                enrollment.userName ||
                enrollment.studentName ||
                enrollment.name ||
                ""
            ).trim();
          const learnerName =
            !learnerRaw ||
            /^\d+$/.test(learnerRaw) ||
            /^learner\s*#?\d+$/i.test(learnerRaw) ||
            /^user\s*#?\d+$/i.test(learnerRaw)
              ? "A learner"
              : learnerRaw;

          pushLocalNotification({
            userId,
            role: "instructor",
            type: "enrollment",
            eventKey: `instructor-enrollment-${enrollment.id || `${enrollment.courseId}-${enrollment.userId}`}`,
            title: `New enrollment in ${course.courseName || "your course"}`,
            message: `${learnerName} enrolled in ${course.courseName || "your course"}.`,
            courseId: String(course.id),
            createdAt: enrollment.enrolledAt || enrollment.createdAt || new Date().toISOString(),
            targetPath: `/instructor-layout/manage-courses/${course.id}/students`,
          });

          const paymentStatus = String(
            enrollment.paymentStatus || enrollment.paymentState || enrollment.paymentResult || ""
          ).toUpperCase();
          if (paymentStatus.includes("SUCCESS") || paymentStatus.includes("PAID")) {
            pushLocalNotification({
              userId,
              role: "instructor",
              type: "payment-success",
              eventKey: `instructor-payment-success-${enrollment.id || `${enrollment.courseId}-${enrollment.userId}`}`,
              title: `Payment received for ${course.courseName || "course"}`,
              message: `${learnerName} completed payment for ${course.courseName || "your course"}.`,
              courseId: String(course.id),
              createdAt: enrollment.updatedAt || enrollment.createdAt || new Date().toISOString(),
              targetPath: `/instructor-layout/manage-courses/${course.id}/students`,
            });
          } else if (paymentStatus.includes("FAILED") || paymentStatus.includes("FAIL")) {
            pushLocalNotification({
              userId,
              role: "instructor",
              type: "payment-failure",
              eventKey: `instructor-payment-failed-${enrollment.id || `${enrollment.courseId}-${enrollment.userId}`}`,
              title: `Payment failed for ${course.courseName || "course"}`,
              message: `${learnerName} payment failed for ${course.courseName || "your course"}.`,
              courseId: String(course.id),
              createdAt: enrollment.updatedAt || enrollment.createdAt || new Date().toISOString(),
              targetPath: `/instructor-layout/manage-courses/${course.id}/students`,
            });
          }

          const progressPercent = Number(enrollment.progressPercentage || enrollment.progress || 0);
          const enrollmentStatus = String(enrollment.status || "").toUpperCase();
          if (progressPercent >= 100 || enrollmentStatus === "COMPLETED") {
            pushLocalNotification({
              userId,
              role: "instructor",
              type: "course-completion",
              eventKey: `instructor-completion-${enrollment.id || `${enrollment.courseId}-${enrollment.userId}`}`,
              title: `Learner completed ${course.courseName || "a course"}`,
              message: `${learnerName} completed ${course.courseName || "your course"}.`,
              courseId: String(course.id),
              createdAt: enrollment.updatedAt || enrollment.completedAt || new Date().toISOString(),
              targetPath: `/instructor-layout/manage-courses/${course.id}/students`,
            });
          }
        });
      } catch {
        // ignore enrollment sync failures
      }
    };

    syncEnrollmentNotifications();
    const timer = setInterval(syncEnrollmentNotifications, 45000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [userId, isAdminPreview]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target)) return;
      setOpenNotifications(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const markAllAsRead = async () => {
    if (isAdminPreview) return;

    const unread = notifications.filter((item) => !item.read);
    if (!unread.length) return;

    await Promise.all(
      unread
        .filter((item) => item.source === "api" && item.sourceId)
        .map((item) => markNotificationRead(String(item.sourceId), userId).catch(() => null))
    );
    markAllLocalNotificationsRead(userId, "instructor");
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearReadNotifications = () => {
    if (isAdminPreview) return;
    if (!userId) return;
    const readIds = notifications.filter((item) => item.read).map((item) => item.id);
    if (!readIds.length) return;

    const storageKey = `cleared_notifications_${userId}`;
    const existingCleared = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updatedCleared = Array.from(new Set([...existingCleared, ...readIds.map(String)]));
    localStorage.setItem(storageKey, JSON.stringify(updatedCleared));

    setNotifications((prev) => prev.filter((item) => !readIds.includes(item.id)));
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="page-title">
          <h1>{pageMeta.title}</h1>
          <span className="sub-head">{pageMeta.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="notification"
          type="button"
          aria-label="Notifications"
          onClick={() => setOpenNotifications((prev) => !prev)}
          disabled={isAdminPreview}
        >
          <FiBell />
          {notifications.filter((item) => !item.read).length > 0 && (
            <span className="badge">{Math.min(notifications.filter((item) => !item.read).length, 9)}</span>
          )}
        </button>

        {openNotifications && (
          <div className="notification-panel" ref={panelRef}>
            <div className="notification-head">
              <span>Notifications</span>
              <div className="head-actions">
                <button type="button" onClick={(event) => { event.stopPropagation(); markAllAsRead(); }} title="Mark all as read"><FiCheck /></button>
                <button type="button" onClick={(event) => { event.stopPropagation(); clearReadNotifications(); }} title="Clear seen notifications"><FiTrash2 /></button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setOpenNotifications(false); }}><FiX /></button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <p className="notification-empty">No new updates</p>
            ) : (
              <div className="notification-list">
                {notifications.map((item) => (
                  <div key={item.id} className={`notification-item ${item.read ? "read" : "unread"}`}>
                    <p className="n-title"><FiEdit3 size={14} />{item.title}</p>
                    {item.message ? <p className="n-message">{item.message}</p> : null}
                    <p className="n-time">{formatRelativeTime(item.createdAt)}</p>
                    <button
                      type="button"
                      className="n-link"
                      onClick={async () => {
                        if (item.source === "api" && item.sourceId) {
                          try {
                            await markNotificationRead(item.sourceId, userId);
                          } catch {
                            // ignore read errors
                          }
                        }
                        if (item.source === "local") {
                          markLocalNotificationRead(item.id, userId);
                        }

                        setOpenNotifications(false);

                        if (item.targetPath) {
                          navigate(item.targetPath);
                          return;
                        }

                        if (item.courseId) {
                          const params = new URLSearchParams();
                          if (item.threadId) params.set("threadId", String(item.threadId));
                          const query = params.toString();
                          navigate(`/courses/${item.courseId}/forum${query ? `?${query}` : ""}`);
                          return;
                        }

                        if (item.threadId) {
                          navigate(`/forum/topic/${item.threadId}`);
                        }
                      }}
                    >
                      View full notification
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="notification-see-all">See all</button>
          </div>
        )}

        <div className="profile">
          <div className="avatar">
            {currentUser?.image ? <img src={currentUser.image} alt={displayName} /> : initials || "IN"}
          </div>
          <div className="profile-info">
            <span className="name">{displayName}</span>
            <span className="email">{displayEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNavBarInstructor;
