import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiEdit3, FiX } from "react-icons/fi";
import { getNotifications, markNotificationRead } from "../../services/discussionApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import "./TopNavBarAdmin.scss";

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

function TopNavBarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useCurrentUser();

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

  const pageMeta = pageMap[normalizedPath] || pageMap["/admin-layout/dashboard"];

  useEffect(() => {
    const userId = currentUser?.id || currentUser?.userId;
    if (!userId) {
      setNotifications([]);
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const list = await getNotifications(String(userId));
        if (!active) return;
        const formatted = (Array.isArray(list) ? list : []).slice(0, 10).map((item) => ({
          id: item.id,
          title: item.title || "New notification",
          message: item.message || "System update available.",
          read: Boolean(item.read),
          courseId: item.courseId || "",
          threadId: item.threadId || "",
          timeLabel: formatRelativeTime(item.createdAt),
        }));
        setNotifications(formatted);
      } catch {
        if (!active) return;
        setNotifications([]);
      }
    };

    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [currentUser?.id, currentUser?.userId]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target)) return;
      setOpenNotifications(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName = currentUser?.name || currentUser?.username || "Admin User";
  const displayEmail = currentUser?.email || "admin@learnsphere.com";
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

  const markAllAsRead = async () => {
    const userId = currentUser?.id || currentUser?.userId;
    if (!userId) return;
    const unread = notifications.filter((item) => !item.read);
    if (!unread.length) return;

    await Promise.all(
      unread.map((item) =>
        markNotificationRead(String(item.id), String(userId)).catch(() => null)
      )
    );
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <div className="page-title">
          <div>{pageMeta.title}</div>
          <span className="sub-head">{pageMeta.subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        <button className="notification" type="button" onClick={() => setOpenNotifications((prev) => !prev)}>
          <FiBell />
          {notifications.length > 0 && <span className="badge">{Math.min(9, notifications.filter((item) => !item.read).length || notifications.length)}</span>}
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
                    <p className="n-time">{item.timeLabel}</p>
                    <button
                      type="button"
                      className="n-link"
                      onClick={async () => {
                        if (item.id) {
                          const userId = currentUser?.id || currentUser?.userId;
                          if (userId) {
                            try {
                              await markNotificationRead(String(item.id), String(userId));
                            } catch {
                              // ignore notification read failures
                            }
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
          <div className="avatar">{initials}</div>
          <div className="profile-info">
            <span className="name">{displayName}</span>
            <span className="email">{displayEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavBarAdmin;
