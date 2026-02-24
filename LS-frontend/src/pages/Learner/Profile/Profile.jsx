import { useEffect, useMemo, useRef, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import profileImage from "../../../assets/Learner/learner-profile.jpeg";
import { getPublishedCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import {
  buildDefaultLearnerProfile,
  getCurrentUser,
  getLearnerProfile,
  getRegistrationSeedByEmail,
  saveLearnerProfile,
} from "../../../services/userProfileStore";
import "./Profile.scss";

function Profile() {
  const infoRef = useRef(null);
  const summaryRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = getCurrentUser();
  const userId = user?.id || user?.userId || "";
  const registrationSeed = getRegistrationSeedByEmail(user?.email);

  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const initialProfile = useMemo(() => {
    const stored = getLearnerProfile(userId);
    return stored || buildDefaultLearnerProfile(user, registrationSeed);
  }, [userId, user, registrationSeed]);

  const [profile, setProfile] = useState(initialProfile);
  const [formData, setFormData] = useState(initialProfile);

  useEffect(() => {
    setProfile(initialProfile);
    setFormData(initialProfile);
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

        const ids = safeCourses.map((course) => String(course.id));
        const list = await getEnrollmentsByCourses(ids);
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
      (item) =>
        String(item.userId) === String(userId) &&
        String(item.status || "").toUpperCase() === "ACTIVE"
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

    const localProgress = JSON.parse(window.appStore.getItem("enrolledCourses") || "[]");
    const testResults = JSON.parse(window.appStore.getItem("testResults") || "[]");

    const completedCourses = withCourse.filter(({ course }) => {
      const record = localProgress.find(
        (entry) =>
          String(entry.courseId) === String(course.id) &&
          String(entry.studentId || entry.userId) === String(userId)
      );
      const progress = Number(record?.progress || 0);
      return progress >= 100;
    });

    const certificatesCount = testResults.filter(
      (result) => String(result.studentId) === String(userId) && result.passed
    ).length;

    const learningHours = Math.floor(
      withCourse.reduce((sum, { course }) => sum + Number(course.lessons || 0) * 0.5, 0)
    );

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

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
    requestAnimationFrame(() => {
      infoRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleSave = () => {
    const normalized = {
      ...formData,
      name: String(formData.name || "").trim(),
      email: String(formData.email || "").trim(),
      phone: String(formData.phone || "").trim(),
      bio: String(formData.bio || "").trim(),
    };

    setProfile(normalized);
    saveLearnerProfile(userId, normalized);
    setIsEditing(false);
    requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result || "");
      setProfile((prev) => ({ ...prev, image }));
      setFormData((prev) => ({ ...prev, image }));
      saveLearnerProfile(userId, { ...formData, image });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-content">
      <div className="profile-summary" ref={summaryRef}>
        <div className="summary-top">
          <div className="summary-left">
            <div className="profile-image-wrapper" onClick={handleImageClick}>
              <img src={profile.image || profileImage} alt="profile" />
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
            Edit Profile
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

          {isEditing && (
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
