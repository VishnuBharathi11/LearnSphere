import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import {
  getCurrentUser,
  getLearnerProfile,
  onProfileUpdated,
} from "../../services/userProfileStore";
import forumService from "../../forum/services/forumService";
import "./TopNavBarStudent.scss";

function TopNavBarStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const panelRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const pageMap = {
    "/student-layout/dashboard": "Dashboard",
    "/student-layout/my-courses": "My Courses",
    "/student-layout/certificate": "Certificates",
    "/student-layout/download-certificate": "Certificate",
    "/student-layout/progress": "Progress",
    "/student-layout/assessment": "Assessment",
    "/student-layout/test": "Quiz",
    "/student-layout/result": "Assessment Result",
    "/student-layout/learn": "Continue Learning",
    "/student-layout/forum": "Discussion",
    "/student-layout/profile": "My Profile",
  };

  const getNormalizedPath = (pathname) => {
    if (pathname.startsWith("/student-layout/certificate")) return "/student-layout/certificate";
    if (pathname.startsWith("/student-layout/download-certificate")) return "/student-layout/download-certificate";
    if (pathname.startsWith("/student-layout/test")) return "/student-layout/test";
    if (pathname.startsWith("/student-layout/result")) return "/student-layout/result";
    if (pathname.startsWith("/student-layout/learn")) return "/student-layout/learn";
    if (pathname.startsWith("/student-layout/forum")) return "/student-layout/forum";
    return pathname;
  };

  const pageTitle = pageMap[getNormalizedPath(location.pathname)] || "Dashboard";

  useEffect(() => {
    const syncUser = () => {
      const user = getCurrentUser();
      const userId = user?.id || user?.userId;
      if (!userId) {
        setCurrentUser(user);
        return;
      }

      const profile = getLearnerProfile(userId);
      setCurrentUser({
        ...user,
        name: profile?.name || user.name,
        username: profile?.name || user.username,
        email: profile?.email || user.email,
        image: profile?.image || user.image || null,
      });
    };

    syncUser();
    return onProfileUpdated(syncUser);
  }, []);

  useEffect(() => {
    const userId = currentUser?.id || currentUser?.userId;
    if (!userId) {
      setNotifications([]);
      return;
    }

    const load = () => {
      const list = forumService
        .getNotifications(String(userId))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 8);
      setNotifications(list);
    };

    load();
    const timer = setInterval(load, 12000);
    return () => clearInterval(timer);
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

  const handleNotificationClick = (item) => {
    const userId = currentUser?.id || currentUser?.userId;
    if (userId) {
      forumService.markNotificationsRead(String(userId), item?.topicId || null);
      const refreshed = forumService
        .getNotifications(String(userId))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 8);
      setNotifications(refreshed);
    }

    setOpenNotifications(false);
    if (item?.topicId) {
      navigate(`/student-layout/forum/topic/${item.topicId}`);
      return;
    }
    navigate("/student-layout/forum");
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
            <div className="notification-head">Notifications</div>
            {notifications.length === 0 ? (
              <p className="notification-empty">No new updates</p>
            ) : (
              <div className="notification-list">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    className={`notification-item ${item.read ? "read" : ""}`}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                  >
                    <p className="n-title">{item.type === "reply" ? "New Reply" : "New Update"}</p>
                    <p className="n-message">{item.message || "You have a new discussion update."}</p>
                  </button>
                ))}
              </div>
            )}
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
