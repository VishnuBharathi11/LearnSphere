import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Upload, User, BookOpen, Users, CheckCircle, Clock } from "lucide-react";
import "./InstructorProfile.scss";
import { getMyProfile, normalizeApiError, updateMyProfile } from "../../../services/authApi";
import {
  buildDefaultInstructorProfile,
  getCurrentUser,
  getRegistrationSeedByEmail,
  saveInstructorProfile,
} from "../../../services/userProfileStore";
import { getInstructorCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import { getCourseDiscussions } from "../../../services/discussionApi";

function InstructorProfile() {
  const [searchParams] = useSearchParams();
  const currentUser = getCurrentUser();
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewUserId = searchParams.get("adminUserId") || "";
  const previewUserName = searchParams.get("adminUserName") || "";
  const previewUserEmail = searchParams.get("adminUserEmail") || "";
  const userId = isAdminPreview ? previewUserId : currentUser?.id;
  const registrationSeed = getRegistrationSeedByEmail(currentUser?.email || "");
  const initialProfile = useMemo(
    () =>
      isAdminPreview
        ? {
            fullName: previewUserName || "Instructor",
            email: previewUserEmail || "",
            phone: "",
            bio: "",
            expertise: "",
            experience: "",
            linkedin: "",
            portfolio: "",
            professionalWebsite: "",
            image: null,
          }
        : buildDefaultInstructorProfile(currentUser, registrationSeed),
    [isAdminPreview, previewUserName, previewUserEmail, currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.phone]
  );
  const loadedProfileUserIdRef = useRef(null);

  const [profileData, setProfileData] = useState(initialProfile);
  const [draftData, setDraftData] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    inReview: 0,
    published: 0,
    totalLearners: 0,
  });

  useEffect(() => {
    if (!userId) return;
    if (isAdminPreview) return;
    if (loadedProfileUserIdRef.current === userId) return;
    loadedProfileUserIdRef.current = userId;

    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await getMyProfile();
        if (!isMounted) return;

        const normalized = {
          fullName: response?.name || initialProfile.fullName,
          email: response?.email || initialProfile.email,
          phone: response?.phone || initialProfile.phone,
          bio: response?.bio || "",
          expertise: response?.expertise || "",
          experience: response?.experience || "",
          linkedin: response?.linkedin || "",
          portfolio: response?.portfolio || "",
          professionalWebsite: response?.professionalWebsite || "",
          image: response?.profileImage || null,
        };

        setProfileData(normalized);
        setDraftData(normalized);

        if (userId) {
          saveInstructorProfile(userId, normalized);
        }
      } catch {
        // Keep default values if profile API is unavailable.
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId, initialProfile, isAdminPreview]);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    async function loadStats() {
      try {
        const courses = await getInstructorCourses(String(userId), 0, 300);
        if (!active) return;
        const safeCourses = Array.isArray(courses) ? courses : [];
        const ids = safeCourses.map((course) => String(course.id));
        const enrollments = await getEnrollmentsByCourses(ids);
        const discussionLists = await Promise.all(
          safeCourses.map((course) => getCourseDiscussions(course.id).catch(() => []))
        );
        if (!active) return;

        const topLevelDiscussionCount = discussionLists
          .flat()
          .filter((post) => post.parentId == null).length;

        setStats({
          totalCourses: safeCourses.length,
          inReview: safeCourses.filter((course) => String(course.status).toUpperCase() === "REVIEW")
            .length,
          published: safeCourses.filter(
            (course) => String(course.status).toUpperCase() === "PUBLISHED"
          ).length,
          totalLearners: Math.max(
            Array.isArray(enrollments) ? enrollments.length : 0,
            topLevelDiscussionCount
          ),
        });
      } catch {
        if (!active) return;
        setStats({
          totalCourses: 0,
          inReview: 0,
          published: 0,
          totalLearners: 0,
        });
      }
    }

    loadStats();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleEdit = () => {
    if (isAdminPreview) return;
    setDraftData(profileData);
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    if (isAdminPreview) return;
    setDraftData(profileData);
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (isAdminPreview) return;
    if (!userId) return;
    setError("");
    setIsSaving(true);

    const sanitized = {
      ...draftData,
      fullName: draftData.fullName.trim(),
      email: profileData.email,
    };

    try {
      const response = await updateMyProfile({
        name: sanitized.fullName,
        phone: sanitized.phone,
        bio: sanitized.bio,
        expertise: sanitized.expertise,
        experience: sanitized.experience,
        linkedin: sanitized.linkedin,
        portfolio: sanitized.portfolio,
        professionalWebsite: sanitized.professionalWebsite,
        profileImage: sanitized.image,
      });

      const saved = {
        ...sanitized,
        fullName: response?.name || sanitized.fullName,
        email: response?.email || sanitized.email,
        phone: response?.phone || sanitized.phone,
        bio: response?.bio || sanitized.bio,
        expertise: response?.expertise || sanitized.expertise,
        experience: response?.experience || sanitized.experience,
        linkedin: response?.linkedin || sanitized.linkedin,
        portfolio: response?.portfolio || sanitized.portfolio,
        professionalWebsite:
          response?.professionalWebsite || sanitized.professionalWebsite,
        image: response?.profileImage || sanitized.image,
      };

      saveInstructorProfile(userId, saved);
      setProfileData(saved);
      setDraftData(saved);
      setIsEditing(false);
    } catch (apiError) {
      setError(normalizeApiError(apiError, "Failed to save profile"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    if (isAdminPreview) return;
    if (!isEditing) return;
    const { name, value } = e.target;
    setDraftData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    if (isAdminPreview) return;
    if (!isEditing) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDraftData((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  if (!currentUser) {
    return (
      <div className="instructor-profile-layout">
        <div className="instructor-profile-page">
          <div className="instructor-profile-form">
            <h2>Profile</h2>
            <p>Please login to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const viewData = isEditing ? draftData : profileData;

  return (
    <div className="instructor-profile-layout">
      <div className="instructor-profile-page">
        <div className="instructor-profile-stats">
          <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} tone="blue" />
          <StatCard icon={Clock} label="In Review" value={stats.inReview} tone="yellow" />
          <StatCard icon={CheckCircle} label="Published" value={stats.published} tone="green" />
          <StatCard icon={Users} label="Total Learners" value={stats.totalLearners} tone="purple" />
        </div>
        <div className="instructor-profile-content">
          <div className="instructor-profile-form">
            <div className="profile-form-head">
              <div className="profile-head-copy">
                <h2>Instructor Profile</h2>
                <p>{isEditing ? "Editing enabled. Save to persist in database." : "Profile is read-only. Click edit to update your information."}</p>
              </div>
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={handleEdit}
                  disabled={isEditing || isAdminPreview}
                >
                  {isAdminPreview ? "Read Only View" : isEditing ? "Editing" : "Edit Profile"}
                </button>
                {isEditing && (
                  <>
                    <button type="button" className="profile-cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button type="button" className="profile-save-btn" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="profile-pic-row">
              <div className="profile-pic">
                {viewData.image ? <img src={viewData.image} alt="profile" /> : <User size={40} />}
              </div>
              <label className={`profile-upload-button ${!isEditing ? "disabled" : ""}`}>
                <p>
                  <Upload size={16} />
                  Upload Photo
                </p>
                <input type="file" hidden accept="image/*" onChange={handleProfilePictureChange} disabled={!isEditing} />
              </label>
            </div>

            <div className="form-row">
              <div>
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={viewData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label>Email *</label>
                <input value={viewData.email} disabled />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Phone</label>
                <input
                  name="phone"
                  value={viewData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label>Experience</label>
                <input
                  name="experience"
                  value={viewData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 4 years in Full-Stack Development"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row single">
              <div>
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={viewData.bio}
                  onChange={handleChange}
                  placeholder="Write a short introduction about your teaching focus."
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row single">
              <div>
                <label>Area of Expertise</label>
                <input
                  name="expertise"
                  value={viewData.expertise}
                  onChange={handleChange}
                  placeholder="e.g., Java, Spring Boot, React, AI"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <h3>Professional Links</h3>
            <div className="form-row">
              <div>
                <label>LinkedIn</label>
                <input
                  name="linkedin"
                  value={viewData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label>Portfolio</label>
                <input
                  name="portfolio"
                  value={viewData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row single">
              <div>
                <label>Other Professional Website</label>
                <input
                  name="professionalWebsite"
                  value={viewData.professionalWebsite}
                  onChange={handleChange}
                  placeholder="https://github.com/..., medium.com/@..."
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }) {
  const Icon = icon;
  return (
    <div className={`instructor-stat-card ${tone}`}>
      <div className="instructor-stat-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default InstructorProfile;
