import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiEdit3, FiX } from "react-icons/fi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getNotifications, markNotificationRead } from "../../services/discussionApi";
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
        setNotifications(
          (Array.isArray(list) ? list : [])
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 8)
        );
      } catch {
        if (!active) return;
        setNotifications([]);
      }
    };

    load();
    const timer = setInterval(load, 12000);
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

  const displayName = currentUser?.name || currentUser?.username || "Learner";
  const displayEmail = currentUser?.email || "learner@learnsphere.com";
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
    const userId = currentUser?.id || currentUser?.userId;
    if (userId && item?.id) {
      try {
        await markNotificationRead(String(item.id), String(userId));
      } catch {
        // Ignore marking failures and continue navigation
      }
      setNotifications((prev) =>
        prev.map((entry) => (String(entry.id) === String(item.id) ? { ...entry, read: true } : entry))
      );
    }

    setOpenNotifications(false);

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
        <h2>{pageTitle}</h2>
      </div>

      <div className="header-right">
        <button
          className="notification"
          type="button"
          aria-label="Notifications"
          onClick={() => setOpenNotifications((prev) => !prev)}
        >
          <FiBell />
          {unreadCount > 0 && <span className="badge">{Math.min(unreadCount, 9)}</span>}
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
                  <div
                    key={item.id}
                    className={`notification-item ${item.read ? "read" : "unread"}`}
                  >
                    <p className="n-title"><FiEdit3 size={14} />{item.title || "New Update"}</p>
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
