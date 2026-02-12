import React, { useEffect, useMemo, useState } from "react";
import { Upload, User, Users, BookOpen, Star, DollarSign } from "lucide-react";
import "./InstructorProfile.scss";

const STORAGE_KEY = "instructorProfile";
function InstructorProfile() {
  const [profileData, setProfileData] = useState(() => {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        fullName: "Dr. John Smith",
        email: "john.smith@learnsphere.com",
        phone: "+1 (555) 123-4567",
        bio: "Passionate educator with 10+ years of experience in web development and computer science.",
        expertise: "Web Development, React, JavaScript, Node.js",
        education: "Ph.D. in Computer Science, Stanford University",
        experience: "10+ years in Software Development and Education",
        website: "",
        linkedin: "",
        twitter: "",
        image: null,
      }
    );
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
  }, [profileData]);
  const stats = useMemo(() => {
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const enrollments =
      JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const ratings = JSON.parse(localStorage.getItem("courseRatings")) || [];
    const totalStudents = new Set(enrollments.map((e) => e.studentId)).size;
    const coursesPublished = courses.length;
    const avgRating =
      ratings.length === 0
        ? "0.0"
        : (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(
            1,
          );
    const totalRevenue = enrollments.reduce((sum, e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return sum + (course?.price || 0);
    }, 0);
    return {
      totalStudents,
      coursesPublished,
      avgRating,
      totalRevenue,
    };
  }, []);
  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="instructor-profile-layout">
      <div className="instructor-profile-page">
        <div className="instructor-profile-stats">
          <div className="instructor-stat-card blue">
            <div className="instructor-stat-icon">
              <Users size={18} />
            </div>
            <div className="instrcutor-stat-content">
              <span>Total Students</span>
              <strong>{stats.totalStudents}</strong>
            </div>
          </div>
          <div className="instructor-stat-card green">
            <div className="instructor-stat-icon">
              <BookOpen size={18} />
            </div>
            <div className="instrcutor-stat-content">
              <span>Courses Published</span>
              <strong>{stats.coursesPublished}</strong>
            </div>
          </div>
          <div className="instructor-stat-card yellow">
            <div className="instructor-stat-icon">
              <Star size={18} />
            </div>
            <div className="instrcutor-stat-content">
              <span>Avg. Rating</span>
              <strong>{stats.avgRating}</strong>
            </div>
          </div>
          <div className="instructor-stat-card purple">
            <div className="instructor-stat-icon">
              <DollarSign size={18} />
            </div>
            <div className="instrcutor-stat-content">
              <span>Total Revenue</span>
              <strong>₹{stats.totalRevenue.toLocaleString()}</strong>
            </div>
          </div>
        </div>
        <div className="instructor-profile-content">
          <div className="instructor-profile-form">
            <h2>Basic Information</h2>
            <div className="profile-pic-row">
              <div className="profile-pic">
                {profileData.image ? (
                  <img src={profileData.image} alt="profile" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <label className="profile-upload-button">
                <p>
                  <Upload size={16} style={{ marginBottom: "-2px" }} />
                  Upload a professional photo
                </p>
                <input
                  type="file"
                  hidden
                  onChange={handleProfilePictureChange}
                />
              </label>
            </div>
            <div className="form-row">
              <div>
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Email *</label>
                <input value={profileData.email} disabled />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Phone</label>
                <input
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Experience</label>
                <input
                  name="experience"
                  value={profileData.experience}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row single">
              <div>
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row single">
              <div>
                <label>Area of Expertise</label>
                <input
                  name="expertise"
                  value={profileData.expertise}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row single">
              <div>
                <label>Education</label>
                <input
                  name="education"
                  value={profileData.education}
                  onChange={handleChange}
                />
              </div>
            </div>
            <h3>Social Links</h3>
            <div className="form-row">
              <div>
                <input
                  name="website"
                  value={profileData.website}
                  onChange={handleChange}
                  placeholder="Website"
                />
              </div>
              <div>
                <input
                  name="linkedin"
                  value={profileData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn"
                />
              </div>
            </div>
            <div className="form-row single">
              <div>
                <input
                  name="twitter"
                  value={profileData.twitter}
                  onChange={handleChange}
                  placeholder="Twitter"
                />
              </div>
            </div>
            <button className="save-btn">Save Settings</button>
          </div>
          <div className="profile-empty" />
        </div>
      </div>
    </div>
  );
}
export default InstructorProfile;