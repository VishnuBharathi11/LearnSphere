import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { Flame, Medal, Target, Trophy, Mail, Phone, User, BookOpen, Clock, Shield, Sparkles, Save, Edit3 } from "lucide-react";
import { getMyProfile, normalizeApiError, updateMyProfile } from "../../../services/authApi";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { setCurrentUser } from "../../../services/userProfileStore";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { getCourseLessons } from "../../../services/courseApi";
import { getProgressByCourses } from "../../../services/progressApi";
import "./Profile.scss";

function Profile() {
  const [searchParams] = useSearchParams();
  const infoRef = useRef(null);
  const summaryRef = useRef(null);
  const fileInputRef = useRef(null);

  const { currentUser: user } = useCurrentUser();
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewUserId = searchParams.get("adminUserId") || "";
  const previewUserName = searchParams.get("adminUserName") || "";
  const previewUserEmail = searchParams.get("adminUserEmail") || "";
  const userId = isAdminPreview ? previewUserId : user?.id || user?.userId || "";

  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lessonMap, setLessonMap] = useState({});
  const [progressMap, setProgressMap] = useState({});

  const initialProfile = useMemo(() => {
    if (isAdminPreview) {
      return {
        name: previewUserName || "Learner",
        email: previewUserEmail || "-",
        phone: "",
        bio: "",
        image: null,
      };
    }
    return {
      name: user?.name || user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: "",
      image: user?.image || null,
    };
  }, [
    isAdminPreview,
    previewUserName,
    previewUserEmail,
    userId,
    user?.name,
    user?.username,
    user?.email,
    user?.phone,
    user?.image,
  ]);

  const [profile, setProfile] = useState(initialProfile);
  const [formData, setFormData] = useState(initialProfile);

  useEffect(() => {
    setProfile((prev) => {
      const prevProfile = JSON.stringify(prev || {});
      const nextProfile = JSON.stringify(initialProfile || {});
      if (prevProfile === nextProfile) return prev;
      return initialProfile;
    });

    setFormData((prev) => {
      const prevForm = JSON.stringify(prev || {});
      const nextForm = JSON.stringify(initialProfile || {});
      if (prevForm === nextForm) return prev;
      return initialProfile;
    });
  }, [initialProfile]);

  useEffect(() => {
    if (!userId || isAdminPreview) return;
    let active = true;
    async function loadProfile() {
      try {
        const response = await getMyProfile();
        if (!active) return;
        const normalized = {
          name: response?.name || initialProfile.name,
          email: response?.email || initialProfile.email,
          phone: response?.phone || initialProfile.phone,
          bio: response?.bio || "",
          image: response?.profileImage || null,
        };
        setProfile(normalized);
        setFormData(normalized);
      } catch {
        // keep defaults
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [userId, isAdminPreview, initialProfile]);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    async function load() {
      try {
        const published = await getPublishedCourses(0, 300);
        if (!active) return;
        const safeCourses = Array.isArray(published) ? published : [];
        setCourses(safeCourses);

        const list = await getEnrollmentsByUser(String(userId));
        if (!active) return;
        setEnrollments(Array.isArray(list) ? list : []);
      } catch {
        if (!active) return;
        setCourses([]);
        setEnrollments([]);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || enrollments.length === 0) {
      setLessonMap({});
      setProgressMap({});
      return;
    }

    const activeEnrollments = enrollments.filter(
      (item) => String(item.userId) === String(userId) && String(item.status || "").toUpperCase() === "ACTIVE"
    );
    const courseIds = activeEnrollments.map((item) => String(item.courseId));
    if (courseIds.length === 0) {
      setLessonMap({});
      setProgressMap({});
      return;
    }

    let active = true;
    async function loadProgress() {
      try {
        const [lessonResults, progressResults] = await Promise.all([
          Promise.all(courseIds.map(async (courseId) => [courseId, await getCourseLessons(courseId).catch(() => [])])),
          getProgressByCourses(userId, courseIds),
        ]);

        if (!active) return;
        setLessonMap(Object.fromEntries(lessonResults));
        const progressPairs = (Array.isArray(progressResults) ? progressResults : []).map((item) => [
          String(item.courseId),
          item,
        ]);
        setProgressMap(Object.fromEntries(progressPairs));
      } catch {
        if (!active) return;
        setLessonMap({});
        setProgressMap({});
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [enrollments, userId]);

  const { enrolledCount, completedCount, certificatesCount, learningHours, achievements } = useMemo(() => {
    const myEnrollments = enrollments.filter(
      (item) => String(item.userId) === String(userId) && String(item.status || "").toUpperCase() === "ACTIVE"
    );

    const withCourse = myEnrollments
      .map((item) => {
        const course = courses.find((c) => String(c.id) === String(item.courseId));
        return course
          ? {
              ...item,
              course,
            }
          : null;
      })
      .filter(Boolean);

    const completedCourses = withCourse.filter(({ course }) => {
      const state = buildCourseLearningStateFromApi(lessonMap[String(course.id)] || [], progressMap[String(course.id)]);
      return state.progressPercentage >= 100;
    });

    const certificatesCount = completedCourses.length;
    const learningHours = Math.floor(withCourse.reduce((sum, { course }) => {
      const state = buildCourseLearningStateFromApi(lessonMap[String(course.id)] || [], progressMap[String(course.id)]);
      return sum + Number(state.completedLessons || 0) * 0.5;
    }, 0));

    const achievements = completedCourses.slice(0, 4).map(({ course }) => ({
      title: course.courseName,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    }));

    return {
      enrolledCount: withCourse.length,
      completedCount: completedCourses.length,
      certificatesCount,
      learningHours,
      achievements,
    };
  }, [courses, enrollments, lessonMap, progressMap, userId]);

  const initials = useMemo(
    () =>
      String(profile?.name || user?.name || "Learner")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [profile?.name, user?.name]
  );

  const persistProfile = async (payload) => {
    if (isAdminPreview) return;
    try {
      await updateMyProfile({
        name: payload.name || "",
        phone: payload.phone || "",
        profileImage: payload.image || null,
        bio: payload.bio || "",
      });
    } catch (error) {
      console.warn(normalizeApiError(error, "Failed to sync profile to backend"));
    }
  };

  const handleEdit = () => {
    if (isAdminPreview) return;
    setFormData(profile);
    setIsEditing(true);
    requestAnimationFrame(() => {
      infoRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleSave = async () => {
    if (isAdminPreview) return;
    const normalized = {
      ...formData,
      name: String(formData.name || "").trim(),
      email: String(formData.email || "").trim(),
      phone: String(formData.phone || "").trim(),
      bio: String(formData.bio || "").trim(),
    };

    setProfile(normalized);
    const baseUser = user || {};
    setCurrentUser({
      ...baseUser,
      name: normalized.name || baseUser.name,
      username: normalized.name || baseUser.username,
      email: normalized.email || baseUser.email,
      phone: normalized.phone || baseUser.phone,
      image: normalized.image || baseUser.image || null,
    });
    await persistProfile(normalized);
    setIsEditing(false);
    requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    if (isAdminPreview) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    if (isAdminPreview) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const image = String(reader.result || "");
      const nextProfile = { ...(profile || {}), image };
      const nextFormData = { ...(formData || {}), image };
      setProfile(nextProfile);
      setFormData(nextFormData);
      const baseUser = user || {};
      setCurrentUser({
        ...baseUser,
        image,
      });
      await persistProfile(nextFormData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-content">
      {/* Immersive Premium Profile Banner Card */}
      <div className="profile-summary" ref={summaryRef}>
        <div className="summary-banner" />
        <div className="summary-top">
          <div className="summary-left">
            <div className="profile-image-wrapper" onClick={handleImageClick} title="Change Profile Avatar">
              {profile.image ? (
                <img src={profile.image} alt="profile" />
              ) : (
                <div className="profile-image-fallback">{initials || "LE"}</div>
              )}
              <div className="edit-icon">
                <FaRegEdit />
              </div>

              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>

            <div className="profile-meta">
              <div className="name-row">
                <h3>{profile.name || "Learner"}</h3>
                <span className="role-badge"><Shield size={12} /> Learner</span>
              </div>
              <p>{profile.email || "-"}</p>
            </div>
          </div>

          <button 
            className={`edit-profile-btn ${isEditing ? "edit-active" : ""}`} 
            onClick={isEditing ? handleSave : handleEdit}
            disabled={isAdminPreview}
          >
            {isAdminPreview ? (
              <span>Read Only View</span>
            ) : isEditing ? (
              <>
                <Save size={15} />
                <span>Save Portfolio</span>
              </>
            ) : (
              <>
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        <div className="summary-divider"></div>
        <div className="summary-stats">
          <div>
            <span>Enrolled Courses</span>
            <strong>{enrolledCount}</strong>
          </div>
          <div>
            <span>Completed Courses</span>
            <strong>{completedCount}</strong>
          </div>
          <div>
            <span>Certificates</span>
            <strong>{certificatesCount}</strong>
          </div>
          <div>
            <span>Learning Hours</span>
            <strong>{learningHours}</strong>
          </div>
        </div>
      </div>

      {/* Gamified Highlights Section */}
      <div className="profile-highlights">
        <div className="highlight-card">
          <div className="highlight-icon-box fire"><Flame size={20} /></div>
          <div>
            <span>Learning Streak</span>
            <strong>{Math.max(1, Math.min(30, completedCount * 2 + 1))} days</strong>
          </div>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon-box target"><Target size={20} /></div>
          <div>
            <span>Goal Completion</span>
            <strong>{enrolledCount ? Math.round((completedCount / enrolledCount) * 100) : 0}%</strong>
          </div>
        </div>
        <div className="highlight-card">
          <div className="highlight-icon-box medal"><Medal size={20} /></div>
          <div>
            <span>Academic Rank</span>
            <strong>{certificatesCount > 0 ? "Elite Graduate" : "Active Scholar"}</strong>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="profile-bottom">
        {/* Left Column - Personal Info Input Fields */}
        <div className="personal-info" ref={infoRef}>
          <div className="section-header">
            <User size={18} className="header-icon" />
            <h3>Personal Information</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={isEditing ? formData.name || "" : profile.name || ""} disabled={!isEditing} onChange={handleChange} placeholder="e.g. John Doe" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input name="email" value={isEditing ? formData.email || "" : profile.email || ""} disabled={!isEditing} onChange={handleChange} placeholder="e.g. john.doe@example.com" />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" value={isEditing ? formData.phone || "" : profile.phone || ""} disabled={!isEditing} onChange={handleChange} placeholder="e.g. +1 (555) 019-2834" />
            </div>

            <div className="form-group full-width">
              <label>Short Bio</label>
              <textarea rows="4" name="bio" value={isEditing ? formData.bio || "" : profile.bio || ""} disabled={!isEditing} onChange={handleChange} placeholder="Tell us about yourself, your learning aspirations, and skills..." />
            </div>
          </div>

          {isEditing && !isAdminPreview && (
            <button className="save-btn" onClick={handleSave}>
              <Save size={16} />
              Save Portfolio Changes
            </button>
          )}
        </div>

        {/* Right Column - Hall of Fame / Achievements */}
        <div className="achievements">
          <div className="section-header">
            <Trophy size={18} className="header-icon" />
            <h3>Hall of Fame</h3>
          </div>

          <div className="achievements-list">
            {achievements.length === 0 ? (
              <div className="empty-achievements">
                <Trophy size={36} />
                <p>No certificates earned yet</p>
                <small>Complete assessments to unlock awards.</small>
              </div>
            ) : (
              achievements.map((item, index) => (
                <div className="achievement-card animate-hover" key={`${item.title}-${index}`}>
                  <span className="achievement-icon"><Trophy size={18} /></span>
                  <div className="achievement-details">
                    <strong>{item.title}</strong>
                    <p>Earned {item.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="achievement-tip">
            <div className="tip-header">
              <Sparkles size={14} />
              <span>Next Milestone Tips</span>
            </div>
            <p>Keep study intervals balanced. Finish active course assessments to unlock verifiable digital credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
