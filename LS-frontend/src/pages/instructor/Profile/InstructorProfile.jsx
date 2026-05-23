import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Upload, User, BookOpen, Users, CheckCircle, Clock, Camera, Globe, Award } from "lucide-react";
import "./InstructorProfile.scss";
import { getMyProfile, normalizeApiError, updateMyProfile } from "../../../services/authApi";
import { setCurrentUser } from "../../../services/userProfileStore";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { getInstructorCourses } from "../../../services/courseApi";
import { getEnrollmentsByCourses } from "../../../services/enrollmentApi";
import { getCourseDiscussions } from "../../../services/discussionApi";

function InstructorProfile() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useCurrentUser();
  const isAdminPreview = searchParams.get("adminPreview") === "true";
  const previewUserId = searchParams.get("adminUserId") || "";
  const previewUserName = searchParams.get("adminUserName") || "";
  const previewUserEmail = searchParams.get("adminUserEmail") || "";
  const userId = isAdminPreview ? previewUserId : currentUser?.id;
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
        : {
            fullName: currentUser?.name || "",
            email: currentUser?.email || "",
            phone: currentUser?.phone || "",
            bio: "",
            expertise: "",
            experience: "",
            linkedin: "",
            portfolio: "",
            professionalWebsite: "",
            image: currentUser?.image || null,
          },
    [isAdminPreview, previewUserName, previewUserEmail, currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.phone, currentUser?.image]
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

      const baseUser = currentUser || {};
      setCurrentUser({
        ...baseUser,
        name: saved.fullName || baseUser.name,
        username: saved.fullName || baseUser.username,
        phone: saved.phone || baseUser.phone,
        image: saved.image || baseUser.image || null,
      });
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
        {/* Immersive Premium Header Summary Card */}
        <div className="instructor-profile-summary">
          <div className="summary-banner"></div>
          <div className="summary-top">
            <div className="summary-left">
              <div className="profile-image-wrapper">
                {viewData.image ? (
                  <img src={viewData.image} alt="profile" />
                ) : (
                  <div className="profile-image-fallback">
                    {viewData.fullName ? viewData.fullName.charAt(0).toUpperCase() : <User size={40} />}
                  </div>
                )}
                {isEditing && (
                  <label className="edit-icon-overlay">
                    <Camera size={16} />
                    <input type="file" hidden accept="image/*" onChange={handleProfilePictureChange} />
                  </label>
                )}
              </div>
              <div className="profile-meta">
                <div className="name-row">
                  <h3>{viewData.fullName || "Instructor"}</h3>
                  <span className="role-badge">Instructor</span>
                </div>
                <p>{viewData.email}</p>
              </div>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={handleEdit}
                  disabled={isAdminPreview}
                >
                  Edit Profile
                </button>
              ) : (
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
        </div>

        {/* Achievements Stat Grid */}
        <div className="instructor-profile-stats">
          <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} tone="blue" description="Courses Created" />
          <StatCard icon={Clock} label="In Review" value={stats.inReview} tone="yellow" description="Awaiting Approval" />
          <StatCard icon={CheckCircle} label="Published" value={stats.published} tone="green" description="Live & Active" />
          <StatCard icon={Users} label="Total Learners" value={stats.totalLearners} tone="purple" description="Enrolled Students" />
        </div>

        {/* Form Details Grid */}
        <div className="profile-bottom-grid">
          {/* Personal Information */}
          <div className="profile-card personal-info">
            <div className="profile-card-header">
              <User size={18} className="header-icon" />
              <h3>Personal Information</h3>
            </div>
            
            {error && <p className="error-text">{error}</p>}
            
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={viewData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input value={viewData.email} disabled />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={viewData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Teaching Experience</label>
                <input
                  name="experience"
                  value={viewData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5+ years in Software Engineering"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group full-width">
                <label>Area of Expertise</label>
                <input
                  name="expertise"
                  value={viewData.expertise}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, Cloud Architecture"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={viewData.bio}
                  onChange={handleChange}
                  placeholder="Tell your students about your professional background, teaching philosophy, or interests."
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="profile-card professional-links">
            <div className="profile-card-header">
              <Globe size={18} className="header-icon" />
              <h3>Professional Profiles</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>LinkedIn Profile</label>
                <input
                  name="linkedin"
                  value={viewData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group full-width">
                <label>Personal Portfolio</label>
                <input
                  name="portfolio"
                  value={viewData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group full-width">
                <label>GitHub or Other Professional URL</label>
                <input
                  name="professionalWebsite"
                  value={viewData.professionalWebsite}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  disabled={!isEditing}
                />
              </div>

              {/* Teaching Tips or Additional Content to populate spaces */}
              <div className="teaching-tips-card">
                <div className="tip-header">
                  <Award size={14} />
                  <span>Instructor Tip</span>
                </div>
                <p>
                  Keep your bio and expertise updated to attract more learners! Students love detailed bios with real-world project portfolios and experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone, description }) {
  const Icon = icon;
  return (
    <div className={`instructor-stat-card ${tone}`}>
      <div className="instructor-stat-icon">
        <Icon size={20} />
      </div>
      <div className="instructor-stat-details">
        <span>{label}</span>
        <strong>{value}</strong>
        {description && <small className="stat-desc">{description}</small>}
      </div>
    </div>
  );
}

export default InstructorProfile;
