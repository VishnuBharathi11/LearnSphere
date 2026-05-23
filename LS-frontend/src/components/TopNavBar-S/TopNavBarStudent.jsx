import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiEdit3, FiTrash2, FiX } from "react-icons/fi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getNotifications, markNotificationRead } from "../../services/discussionApi";
import { getEnrollmentsByUser } from "../../services/enrollmentApi";
import { getCourseLessons, getCoursesByIds } from "../../services/courseApi";
import { getProgressByCourses } from "../../services/progressApi";
import { buildCourseLearningStateFromApi } from "../../services/learnerProgressStore";
import {
  getLocalNotificationsByUser,
  markAllLocalNotificationsRead,
  markLocalNotificationRead,
  pushLocalNotification,
} from "../../services/activityNotificationStore";
import "./TopNavBarStudent.scss";

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
    if (actor) return `${actor} replied to your thread.`;
    return "New reply on your thread.";
  }

  if (type.includes("question") || type.includes("thread")) {
    if (actor && topicTitle) return `${actor} posted a question: "${topicTitle}".`;
    if (actor) return `${actor} posted a new question.`;
    return "New learner question posted.";
  }

  return "You have a new discussion update.";
}

function TopNavBarStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef(null);
  const { currentUser } = useCurrentUser();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const pageMap = {
    "/student-layout/dashboard": "Dashboard",
    "/student-layout/my-courses": "My Courses",
    "/student-layout/certificate": "Certificates",
    "/student-layout/download-certificate": "Certificate",
    "/student-layout/progress": "Progress",
    "/student-layout/test": "Quiz",
    "/student-layout/result": "Assessment Result",
    "/student-layout/learn": "Continue Learning",
    "/student-layout/profile": "My Profile",
  };

  const getNormalizedPath = (pathname) => {
    if (pathname.startsWith("/student-layout/certificate")) return "/student-layout/certificate";
    if (pathname.startsWith("/student-layout/download-certificate")) return "/student-layout/download-certificate";
    if (pathname.startsWith("/student-layout/test")) return "/student-layout/test";
    if (pathname.startsWith("/student-layout/result")) return "/student-layout/result";
    if (pathname.startsWith("/student-layout/learn")) return "/student-layout/learn";
    return pathname;
  };

  const pageTitle = pageMap[getNormalizedPath(location.pathname)] || "Dashboard";
  const searchParams = new URLSearchParams(location.search);
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewUserName = searchParams.get("adminUserName") || "";
  const previewUserEmail = searchParams.get("adminUserEmail") || "";

  useEffect(() => {
    if (isAdminPreview) {
      setNotifications([]);
      return;
    }

    const userId = currentUser?.id || currentUser?.userId;
    if (!userId) {
      setNotifications([]);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const [list, localList] = await Promise.all([
          getNotifications(String(userId)),
          Promise.resolve(getLocalNotificationsByUser(String(userId), "learner")),
        ]);
        if (!active) return;

        const discussionNotifications = (Array.isArray(list) ? list : []).map((item) => ({
          id: `api-${item.id}`,
          source: "api",
          sourceId: item.id,
          title: item.title || "New discussion update",
          message: buildDiscussionMessage(item),
          read: Boolean(item.read),
          courseId: item.courseId || "",
          threadId: item.threadId || "",
          targetPath: "",
          createdAt: item.createdAt || new Date().toISOString(),
        }));

        const localNotifications = (Array.isArray(localList) ? localList : []).map((item) => ({
          ...item,
          source: "local",
          createdAt: item.createdAt || new Date().toISOString(),
        }));

        const storageKey = `cleared_notifications_${userId}`;
        const clearedIds = JSON.parse(localStorage.getItem(storageKey) || "[]");

        setNotifications(
          [...localNotifications, ...discussionNotifications]
            .filter((item) => !clearedIds.includes(String(item.id)))
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 12)
        );
      } catch {
        if (!active) return;
        const storageKey = `cleared_notifications_${userId}`;
        const clearedIds = JSON.parse(localStorage.getItem(storageKey) || "[]");
        setNotifications(
          getLocalNotificationsByUser(String(userId), "learner")
            .filter((item) => !clearedIds.includes(String(item.id)))
            .slice(0, 12)
        );
      }
    };

    load();
    const timer = setInterval(load, 12000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [currentUser?.id, currentUser?.userId, isAdminPreview]);

  useEffect(() => {
    if (isAdminPreview) return;

    const userId = currentUser?.id || currentUser?.userId;
    if (!userId) return;

    let active = true;
    const syncCourseCompletionNotifications = async () => {
      try {
        const enrollmentList = await getEnrollmentsByUser(String(userId));
        if (!active) return;
        const activeCourseIds = (Array.isArray(enrollmentList) ? enrollmentList : [])
          .filter(
            (enrollment) =>
              String(enrollment.userId) === String(userId) &&
              String(enrollment.status || "").toUpperCase() === "ACTIVE"
          )
          .map((enrollment) => String(enrollment.courseId));
        if (!active || activeCourseIds.length === 0) return;

        const [courses, progressList, lessonsList] = await Promise.all([
          getCoursesByIds(activeCourseIds),
          getProgressByCourses(String(userId), activeCourseIds),
          Promise.all(
            activeCourseIds.map(async (courseId) => {
              try {
                const lessons = await getCourseLessons(courseId);
                return [courseId, Array.isArray(lessons) ? lessons : []];
              } catch {
                return [courseId, []];
              }
            })
          ),
        ]);
        if (!active) return;

        const progressMap = {};
        (Array.isArray(progressList) ? progressList : []).forEach((item) => {
          progressMap[String(item.courseId)] = item;
        });
        const lessonMap = {};
        (Array.isArray(lessonsList) ? lessonsList : []).forEach(([courseId, lessons]) => {
          lessonMap[String(courseId)] = lessons;
        });

        (Array.isArray(courses) ? courses : []).forEach((course) => {
          if (!course?.id) return;
          const state = buildCourseLearningStateFromApi(
            lessonMap[String(course.id)] || [],
            progressMap[String(course.id)] || null
          );
          if (!state.certificateUnlocked) return;

          pushLocalNotification({
            userId: String(userId),
            role: "learner",
            type: "course-completion",
            eventKey: `learner-course-complete-${course.id}`,
            title: `Course completed: ${course.courseName || "Course"}`,
            message: `You completed ${course.courseName || "this course"} and your certificate is ready.`,
            courseId: String(course.id),
            targetPath: `/student-layout/download-certificate/${course.id}`,
          });
        });
      } catch {
        // ignore completion sync failures
      }
    };

    syncCourseCompletionNotifications();
    const timer = setInterval(syncCourseCompletionNotifications, 60000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [currentUser?.id, currentUser?.userId, isAdminPreview]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target)) return;
      setOpenNotifications(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName = isAdminPreview
    ? previewUserName || "Learner"
    : currentUser?.name || currentUser?.username || "Learner";
  const displayEmail = isAdminPreview
    ? previewUserEmail || "learner@learnsphere.com"
    : currentUser?.email || "learner@learnsphere.com";
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [displayName]
  );
  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleNotificationClick = async (item) => {
    if (isAdminPreview) return;

    const userId = currentUser?.id || currentUser?.userId;
    if (userId && item?.id && item?.source === "api" && item?.sourceId) {
      try {
        await markNotificationRead(String(item.sourceId), String(userId));
      } catch {
        // Ignore marking failures and continue navigation
      }
      setNotifications((prev) =>
        prev.map((entry) => (String(entry.id) === String(item.id) ? { ...entry, read: true } : entry))
      );
    }
    if (userId && item?.id && item?.source === "local") {
      markLocalNotificationRead(String(item.id), String(userId));
      setNotifications((prev) =>
        prev.map((entry) => (String(entry.id) === String(item.id) ? { ...entry, read: true } : entry))
      );
    }

    setOpenNotifications(false);

    if (item?.targetPath) {
      navigate(item.targetPath);
      return;
    }

    if (item?.courseId) {
      const query = new URLSearchParams();
      query.set("tab", "discussion");
      if (item?.threadId) query.set("threadId", String(item.threadId));
      navigate(`/student-layout/learn/${item.courseId}?${query.toString()}`);
      return;
    }

    navigate("/student-layout/my-courses");
  };

  const markAllAsRead = async () => {
    if (isAdminPreview) return;

    const userId = currentUser?.id || currentUser?.userId;
    if (!userId) return;
    const unread = notifications.filter((item) => !item.read);
    if (!unread.length) return;

    await Promise.all(
      unread
        .filter((item) => item.source === "api" && item.sourceId)
        .map((item) => markNotificationRead(String(item.sourceId), String(userId)).catch(() => null))
    );
    markAllLocalNotificationsRead(String(userId), "learner");
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearReadNotifications = () => {
    if (isAdminPreview) return;
    const userId = currentUser?.id || currentUser?.userId;
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
    <div className="dashboard-header">
      <div className="header-left">
        <h2>{pageTitle}</h2>
      </div>

      <div className="header-right">
        <button
          className="notification"
          type="button"
          aria-label="Notifications"
          onClick={() => {
            if (isAdminPreview) return;
            setOpenNotifications((prev) => !prev);
          }}
        >
          <FiBell />
          {unreadCount > 0 && <span className="badge">{Math.min(unreadCount, 9)}</span>}
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
                  <div
                    key={item.id}
                    className={`notification-item ${item.read ? "read" : "unread"}`}
                  >
                    <p className="n-title"><FiEdit3 size={14} />{item.title || "New Update"}</p>
                    {item.message ? <p className="n-message">{item.message}</p> : null}
                    <p className="n-time">{formatRelativeTime(item.createdAt)}</p>
                    <button type="button" className="n-link" onClick={() => handleNotificationClick(item)}>
                      View full notification
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" className="notification-see-all">
              See all
            </button>
          </div>
        )}

        <div className="profile">
          <div className="avatar">
            {currentUser?.image ? <img src={currentUser.image} alt={displayName} /> : initials}
          </div>
          <div className="profile-info">
            <span className="name">{displayName}</span>
            <span className="email">{displayEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavBarStudent;
