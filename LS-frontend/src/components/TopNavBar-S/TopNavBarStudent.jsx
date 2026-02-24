import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import {
  getCurrentUser,
  getLearnerProfile,
  onProfileUpdated,
} from "../../services/userProfileStore";
import "./TopNavBarStudent.scss";

function TopNavBarStudent() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const pageMap = {
    "/student-layout/dashboard": "Dashboard",
    "/student-layout/my-courses": "My Courses",
    "/student-layout/certificate": "Certificate",
    "/student-layout/progress": "Progress",
    "/student-layout/assessment": "Assessment",
    "/student-layout/test": "Quiz",
    "/student-layout/result": "Assessment Result",
    "/student-layout/profile": "My Profile",
  };
  const getNormalizedPath=(pathname)=>{
    if(pathname.startsWith("/student-layout/certificate"))
      return "/student-layout/certificate";
    if(pathname.startsWith("/student-layout/test"))
      return "/student-layout/test";
    if(pathname.startsWith("/student-layout/result"))
      return "/student-layout/result";
    return pathname;
  }
  const pageTitle = pageMap[getNormalizedPath(location.pathname)] || "Dashboard";

  useEffect(() => {
    const syncUser = () => {
      const user = getCurrentUser();
      if (!user?.id) {
        setCurrentUser(user);
        return;
      }
      const profile = getLearnerProfile(user.id);
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

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h2>{pageTitle}</h2>
      </div>

      <div className="header-right">
        <div className="notification">
          <FiBell />
          <span className="badge">2</span>
        </div>

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
