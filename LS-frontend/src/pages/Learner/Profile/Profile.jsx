import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { normalizeApiError, updateMyProfile } from "../../../services/authApi";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningState } from "../../../services/learnerProgressStore";
import {
  buildDefaultLearnerProfile,
  getCurrentUser,
  getLearnerProfile,
  getRegistrationSeedByEmail,
  saveLearnerProfile,
} from "../../../services/userProfileStore";
import "./Profile.scss";

function Profile() {
  const [searchParams] = useSearchParams();
  const infoRef = useRef(null);
  const summaryRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = getCurrentUser();
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewUserId = searchParams.get("adminUserId") || "";
  const previewUserName = searchParams.get("adminUserName") || "";
  const previewUserEmail = searchParams.get("adminUserEmail") || "";
  const userId = isAdminPreview ? previewUserId : user?.id || user?.userId || "";
  const registrationSeed = useMemo(() => getRegistrationSeedByEmail(user?.email), [user?.email]);

  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const initialProfile = useMemo(() => {
    const stored = getLearnerProfile(userId);
    if (isAdminPreview) {
      return {
        name: previewUserName || stored?.name || "Learner",
        email: previewUserEmail || stored?.email || "-",
        phone: stored?.phone || "",
        bio: stored?.bio || "",
        image: stored?.image || null,
      };
    }
    return stored || buildDefaultLearnerProfile(user, registrationSeed);
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
    registrationSeed?.name,
    registrationSeed?.email,
    registrationSeed?.phone,
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
      const state = buildCourseLearningState(userId, course.id);
      return state.progressPercentage >= 100;
    });

    const certificatesCount = completedCourses.length;
    const learningHours = Math.floor(withCourse.reduce((sum, { course }) => {
      const state = buildCourseLearningState(userId, course.id);
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
  }, [courses, enrollments, userId]);

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
        email: payload.email || "",
        phone: payload.phone || "",
        image: payload.image || null,
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
    saveLearnerProfile(userId, normalized);
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
      saveLearnerProfile(userId, nextFormData);
      await persistProfile(nextFormData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-content">
      <div className="profile-summary" ref={summaryRef}>
        <div className="summary-top">
          <div className="summary-left">
            <div className="profile-image-wrapper" onClick={handleImageClick}>
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

            <div>
              <h3>{profile.name || "Learner"}</h3>
              <p>{profile.email || "-"}</p>
              <span className="role-badge">Learner</span>
            </div>
          </div>

          <button className="edit-profile-btn" onClick={handleEdit}>
            {isAdminPreview ? "Read Only View" : "Edit Profile"}
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

      <div className="profile-bottom">
        <div className="personal-info" ref={infoRef}>
          <h3>Personal Information</h3>

          <label>Full Name</label>
          <input name="name" value={formData.name || ""} disabled={!isEditing} onChange={handleChange} />

          <label>Email</label>
          <input name="email" value={formData.email || ""} disabled={!isEditing} onChange={handleChange} />

          <label>Phone Number</label>
          <input name="phone" value={formData.phone || ""} disabled={!isEditing} onChange={handleChange} />

          <label>Bio</label>
          <textarea rows="4" name="bio" value={formData.bio || ""} disabled={!isEditing} onChange={handleChange} />

          {isEditing && !isAdminPreview && (
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>

        <div className="achievements">
          <h3>Achievements</h3>

          {achievements.length === 0 ? (
            <p>No achievements yet</p>
          ) : (
            achievements.map((item, index) => (
              <div className="achievement-card" key={`${item.title}-${index}`}>
                <span className="achievement-icon">Trophy</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>Completed {item.date}</p>
                </div>
              </div>
            ))
          )}

          <div className="achievement-tip">
            Keep progressing consistently.
            <p>Complete lessons and assessments to unlock more certificates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
