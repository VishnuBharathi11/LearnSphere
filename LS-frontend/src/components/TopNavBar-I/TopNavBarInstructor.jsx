import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiEdit3, FiX } from "react-icons/fi";
import { getNotifications, markNotificationRead } from "../../services/discussionApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
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
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useCurrentUser();

  const displayName = currentUser?.name || currentUser?.username || "Instructor";
  const displayEmail = currentUser?.email || "instructor@learnsphere.com";
  const userId = currentUser?.id ? String(currentUser.id) : "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fetchNotifications = useMemo(
    () => async () => {
      if (!userId) return;

      try {
        const discussionList = await getNotifications(userId);

        const discussionNotifications = (discussionList || []).map((item) => ({
          id: `d-${item.id}`,
          sourceId: item.id,
          title: item.title || "New discussion update",
          message: item.message || "A learner posted in your course discussion.",
          rank: item.createdAt ? new Date(item.createdAt).getTime() : Number(item.id) || 0,
          courseId: item.courseId || "",
          threadId: item.threadId || "",
          read: Boolean(item.read),
          createdAt: item.createdAt,
        }));

        const merged = [...discussionNotifications]
          .sort((a, b) => b.rank - a.rank)
          .slice(0, 10);

        setNotifications(merged);
      } catch {
        setNotifications([]);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

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
    const unread = notifications.filter((item) => !item.read && item.sourceId);
    if (!unread.length) return;

    await Promise.all(
      unread.map((item) =>
        markNotificationRead(String(item.sourceId), userId).catch(() => null)
      )
    );
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
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
                <button type="button" onClick={(event) => { event.stopPropagation(); markAllAsRead(); }}><FiCheck /></button>
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
                    <p className="n-time">{formatRelativeTime(item.createdAt)}</p>
                    <button
                      type="button"
                      className="n-link"
                      onClick={async () => {
                        if (item.sourceId) {
                          try {
                            await markNotificationRead(item.sourceId, userId);
                          } catch {
                            // ignore read errors
                          }
                        }

                        setOpenNotifications(false);

                        if (item.threadId) {
                          navigate(`/forum/topic/${item.threadId}`);
                          return;
                        }

                        if (item.courseId) {
                          navigate(`/courses/${item.courseId}/forum`);
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
