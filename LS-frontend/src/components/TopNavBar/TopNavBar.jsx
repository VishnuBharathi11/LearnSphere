import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiEdit3, FiTrash2, FiX } from "react-icons/fi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getNotifications, markNotificationRead } from "../../services/discussionApi";

// For Instructor/Learner specific notifications
import { getInstructorCourses, getCourseLessons, getCoursesByIds } from "../../services/courseApi";
import { getEnrollmentsByUser, getEnrollmentsByCourses } from "../../services/enrollmentApi";
import { getProgressByCourses } from "../../services/progressApi";
import { buildCourseLearningStateFromApi } from "../../services/learnerProgressStore";
import {
  getLocalNotificationsByUser,
  markAllLocalNotificationsRead,
  markLocalNotificationRead,
  pushLocalNotification,
} from "../../services/activityNotificationStore";

import "./TopNavBar.scss";

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

function TopNavBar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const { currentUser } = useCurrentUser();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewUserName = searchParams.get("adminUserName") || "";
  const previewUserEmail = searchParams.get("adminUserEmail") || "";

  const displayName = isAdminPreview
    ? previewUserName || (role === "instructor" ? "Instructor" : "Learner")
    : currentUser?.name || currentUser?.username || (role === "admin" ? "Admin User" : role === "instructor" ? "Instructor" : "Learner");

  const displayEmail = isAdminPreview
    ? previewUserEmail || (role === "instructor" ? "instructor@learnsphere.com" : "learner@learnsphere.com")
    : currentUser?.email || (role === "admin" ? "admin@learnsphere.com" : role === "instructor" ? "instructor@learnsphere.com" : "learner@learnsphere.com");

  const userId = currentUser?.id || currentUser?.userId ? String(currentUser.id || currentUser.userId) : "";

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [displayName]);

  // Page Title Resolver
  const pageMeta = useMemo(() => {
    if (role === "admin") {
      const pageMap = {
        "/admin-layout/dashboard": { title: "System Overview", subtitle: "Platform-wide health and controls" },
        "/admin-layout/users": { title: "Manage Users", subtitle: "Students, instructors and admins" },
        "/admin-layout/courses": { title: "Manage Courses", subtitle: "Oversee all courses in the platform" },
        "/admin-layout/approve-courses": { title: "Approve Courses", subtitle: "Review and approve submissions" },
        "/admin-layout/categories": { title: "Category Management", subtitle: "Maintain course taxonomy" },
        "/admin-layout/roles": { title: "Role Management", subtitle: "Control permissions and access" },
        "/admin-layout/settings": { title: "Platform Settings", subtitle: "Manage global system behavior" },
        "/admin-layout/forum": { title: "Discussions", subtitle: "Moderate forum conversations" },
      };
      const normalizedPath =
        location.pathname.startsWith("/courses/") && location.pathname.endsWith("/forum")
          ? "/admin-layout/forum"
          : location.pathname.startsWith("/admin-layout/forum/topic/") || location.pathname.startsWith("/forum/topic/")
            ? "/admin-layout/forum"
            : location.pathname;
      return pageMap[normalizedPath] || pageMap["/admin-layout/dashboard"];
    }

    if (role === "instructor") {
      const pathname = location.pathname;
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
        "/instructor-layout/withdrawals": {
          title: "Withdrawals",
          subtitle: "Review earnings and request instructor payouts",
        },
        "/instructor-layout/profile": {
          title: "My Profile",
          subtitle: "Update your public instructor profile",
        },
      };

      return (
        PAGE_MAP[pathname] || {
          title: "Instructor Dashboard",
          subtitle: "Overview of your activity and learner engagement",
        }
      );
    }

    // Default: Learner / Student
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

    const title = pageMap[getNormalizedPath(location.pathname)] || "Dashboard";
    return { title, subtitle: "" };
  }, [location.pathname, role]);

  // Load notifications (API + Local)
  useEffect(() => {
    if (isAdminPreview) {
      setNotifications([]);
      return;
    }
    if (!userId) return;

    let active = true;
    const load = async () => {
      try {
        if (role === "admin") {
          const list = await getNotifications(userId);
          if (!active) return;
          const formatted = (Array.isArray(list) ? list : []).slice(0, 10).map((item) => ({
            id: item.id,
            title: item.title || "New notification",
            message: item.message || "System update available.",
            read: Boolean(item.read),
            courseId: item.courseId || "",
            threadId: item.threadId || "",
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          const storageKey = `cleared_notifications_${userId}`;
          const clearedIds = JSON.parse(localStorage.getItem(storageKey) || "[]");
          setNotifications(formatted.filter((item) => !clearedIds.includes(String(item.id))));
        } else {
          // Learner or Instructor
          const targetRole = role === "instructor" ? "instructor" : "learner";
          const [list, localList] = await Promise.all([
            getNotifications(userId),
            Promise.resolve(getLocalNotificationsByUser(userId, targetRole)),
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
        }
      } catch {
        if (!active) return;
        if (role !== "admin") {
          const targetRole = role === "instructor" ? "instructor" : "learner";
          const storageKey = `cleared_notifications_${userId}`;
          const clearedIds = JSON.parse(localStorage.getItem(storageKey) || "[]");
          setNotifications(
            getLocalNotificationsByUser(userId, targetRole)
              .filter((item) => !clearedIds.includes(String(item.id)))
              .slice(0, 12)
          );
        } else {
          setNotifications([]);
        }
      }
    };

    let timer;
    const poll = async () => {
      if (!document.hidden) {
        await load();
      }
      if (active) timer = window.setTimeout(poll, 60000);
    };
    poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [userId, isAdminPreview, role]);

  // Student specific: Course completion sync
  useEffect(() => {
    if (role !== "learner" || isAdminPreview || !userId) return;
    let active = true;
    const syncCourseCompletionNotifications = async () => {
      try {
        const enrollmentList = await getEnrollmentsByUser(userId);
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
          getProgressByCourses(userId, activeCourseIds),
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
            userId,
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
      }
    };
    let timer;
    const poll = async () => {
      if (!document.hidden) {
        await syncCourseCompletionNotifications();
      }
      if (active) timer = window.setTimeout(poll, 180000);
    };
    poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [userId, isAdminPreview, role]);

  // Instructor specific: Enrollment notifications sync
  useEffect(() => {
    if (role !== "instructor" || isAdminPreview || !userId) return;
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
      }
    };
    let timer;
    const poll = async () => {
      if (!document.hidden) {
        await syncEnrollmentNotifications();
      }
      if (active) timer = window.setTimeout(poll, 180000);
    };
    poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [userId, isAdminPreview, role]);

  // Click outside to close notification panel
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
    if (isAdminPreview || !userId) return;
    const unread = notifications.filter((item) => !item.read);
    if (!unread.length) return;
    
    if (role === "admin") {
      await Promise.all(
        unread.map((item) => markNotificationRead(String(item.id), userId).catch(() => null))
      );
    } else {
      await Promise.all(
        unread
          .filter((item) => item.source === "api" && item.sourceId)
          .map((item) => markNotificationRead(String(item.sourceId), userId).catch(() => null))
      );
      const targetRole = role === "instructor" ? "instructor" : "learner";
      markAllLocalNotificationsRead(userId, targetRole);
    }
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearReadNotifications = () => {
    if (isAdminPreview || !userId) return;
    const readIds = notifications.filter((item) => item.read).map((item) => item.id);
    if (!readIds.length) return;
    const storageKey = `cleared_notifications_${userId}`;
    const existingCleared = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updatedCleared = Array.from(new Set([...existingCleared, ...readIds.map(String)]));
    localStorage.setItem(storageKey, JSON.stringify(updatedCleared));
    setNotifications((prev) => prev.filter((item) => !readIds.includes(item.id)));
  };

  const handleNotificationClick = async (item) => {
    if (isAdminPreview) return;
    if (!userId) return;

    if (role === "admin") {
      if (item.id) {
        try {
          await markNotificationRead(String(item.id), userId);
        } catch {}
      }
      setOpenNotifications(false);
      if (item.threadId) {
        navigate(`/forum/topic/${item.threadId}`);
        return;
      }
      if (item.courseId) {
        navigate(`/courses/${item.courseId}/forum`);
      }
      return;
    }

    // Instructor and Learner roles
    if (item?.id && item?.source === "api" && item?.sourceId) {
      try {
        await markNotificationRead(String(item.sourceId), userId);
      } catch {}
      setNotifications((prev) =>
        prev.map((entry) => (String(entry.id) === String(item.id) ? { ...entry, read: true } : entry))
      );
    }
    if (item?.id && item?.source === "local") {
      markLocalNotificationRead(String(item.id), userId);
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
      if (role === "learner") {
        const query = new URLSearchParams();
        query.set("tab", "discussion");
        if (item?.threadId) query.set("threadId", String(item.threadId));
        navigate(`/student-layout/learn/${item.courseId}?${query.toString()}`);
      } else {
        const params = new URLSearchParams();
        if (item.threadId) params.set("threadId", String(item.threadId));
        const query = params.toString();
        navigate(`/courses/${item.courseId}/forum${query ? `?${query}` : ""}`);
      }
      return;
    }

    if (item?.threadId) {
      navigate(`/forum/topic/${item.threadId}`);
      return;
    }

    navigate(role === "learner" ? "/student-layout/my-courses" : "/instructor-layout/dashboard");
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="page-title">
          {role === "learner" ? <h2>{pageMeta.title}</h2> : <h1>{pageMeta.title}</h1>}
          {pageMeta.subtitle && <span className="sub-head">{pageMeta.subtitle}</span>}
        </div>
      </div>
      <div className="header-right">
        <button
          className="notification"
          type="button"
          aria-label="Notifications"
          onClick={() => {
            if (!isAdminPreview) {
              setOpenNotifications((prev) => !prev);
            }
          }}
          disabled={isAdminPreview}
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
                  <div key={item.id} className={`notification-item ${item.read ? "read" : "unread"}`}>
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
            <button type="button" className="notification-see-all">See all</button>
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
    </header>
  );
}

export default TopNavBar;
