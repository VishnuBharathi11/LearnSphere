import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import { getInstructorCourses } from "../../services/courseApi";
import {
  getCurrentUser,
  getInstructorProfile,
  onProfileUpdated,
} from "../../services/userProfileStore";
import "./TopNavBarInstructor.scss";

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
  "/instructor-layout/discussions": {
    title: "Discussions",
    subtitle: "Respond to learner questions and feedback",
  },
  "/instructor-layout/forum": {
    title: "Discussions",
    subtitle: "Respond to learner questions and feedback",
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
    return { title: "Create Quiz", subtitle: "Create assessment for this course" };
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
  if (pathname.includes("/forum/topic/") || pathname.includes("/courses/") && pathname.endsWith("/forum")) {
    return { title: "Discussions", subtitle: "Respond to learner questions and feedback" };
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
  const pageMeta = resolvePageMeta(location.pathname);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());

  useEffect(() => {
    const syncUser = () => {
      const rawUser = getCurrentUser();
      if (!rawUser?.id) {
        setCurrentUserState(rawUser);
        return;
      }

      const profile = getInstructorProfile(rawUser.id);
      setCurrentUserState({
        ...rawUser,
        name: profile?.fullName || rawUser.name,
        image: profile?.image || rawUser.image || null,
      });
    };

    syncUser();
    return onProfileUpdated(syncUser);
  }, []);

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
        const token = window.appStore.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [discussionRes, courseStatuses] = await Promise.all([
          axios.get(`/notifications/${userId}`, { headers }),
          getInstructorCourses(userId),
        ]);

        const discussionNotifications = (discussionRes.data || []).map((item) => ({
          id: `d-${item.id}`,
          title: item.title || "New discussion update",
          message: item.message || "A learner posted in your discussion thread.",
          rank: Number(item.id) || 0,
        }));

        const courseNotifications = (courseStatuses || [])
          .filter((course) => course.status === "PUBLISHED" || course.status === "REVIEW")
          .map((course) => ({
            id: `c-${course.id}-${course.status}`,
            title: course.status === "PUBLISHED" ? "Course Approved" : "Course In Review",
            message:
              course.status === "PUBLISHED"
                ? `"${course.courseName}" is approved and now visible to learners.`
                : `"${course.courseName}" has been submitted and is waiting for admin review.`,
            rank: course.createdAt ? new Date(course.createdAt).getTime() : 0,
          }));

        const merged = [...courseNotifications, ...discussionNotifications]
          .sort((a, b) => b.rank - a.rank)
          .slice(0, 8);

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
          {notifications.length > 0 && <span className="badge">{Math.min(notifications.length, 9)}</span>}
        </button>

        {openNotifications && (
          <div className="notification-panel">
            <div className="notification-head">Notifications</div>
            {notifications.length === 0 ? (
              <p className="notification-empty">No new updates</p>
            ) : (
              <div className="notification-list">
                {notifications.map((item) => (
                  <div key={item.id} className="notification-item">
                    <p className="n-title">{item.title}</p>
                    <p className="n-message">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
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
