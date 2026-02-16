import React, { useEffect, useMemo, useState } from "react";
import { Upload, User, Users, BookOpen, Star, DollarSign } from "lucide-react";
import "./InstructorProfile.scss";

function InstructorProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const STORAGE_KEY=`instructorProfile_${currentUser.id}`;
  const [profileData, setProfileData] = useState(() => {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        fullName: currentUser.name||"",
        email: currentUser.email||"",
        phone: "",
        bio: "",
        expertise: "",
        education: "",
        experience: "",
        website: "",
        linkedin: "",
        twitter: "",
        image: null,
      }
    );
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
  }, [profileData,STORAGE_KEY]);

  const stats = useMemo(() => {
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const enrollments = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    const ratings = JSON.parse(localStorage.getItem("courseRatings")) || [];

    const instructorCourses=courses.filter((c)=>c.instructorId===currentUser.id);
    const instructorCourseIds=instructorCourses.map((c)=>c.id);

    const totalStudents = new Set(enrollments.filter((e)=>instructorCourseIds.includes(e.courseId)).map((e)=>e.studentId)).size;
    //const coursesPublished = courses.length;
    const avgRatingData =ratings.filter((r)=>instructorCourseIds.includes(r.courseId));
    const avgRating=avgRatingData.length===0?"0.0":(avgRatingData.reduce((s,r)=>s+r.rating,0)/avgRatingData.length).toFixed(1);
    const totalRevenue = enrollments
    .filter((e)=>instructorCourseIds.includes(e.courseId))
    .reduce((sum, e) => {
      const course = instructorCourses.find((c) => c.id === e.courseId);
      return sum + (course?.price || 0);
    }, 0);
    return {
      totalStudents,
      coursesPublished:instructorCourses.length,
      avgRating,
      totalRevenue,
    };
  }, [currentUser.id]);
  const handleChange = (e) => {setProfileData({...profileData,[e.target.name]: e.target.value,});
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
          <Stat icon={Users} label="Total Students" value={stats.totalStudents} color="blue" />
          <Stat icon={BookOpen} label="Courses Published" value={stats.coursesPublished} color="green" />
          <Stat icon={Star} label="Avg. Rating" value={stats.avgRating} color="yellow" />
          <Stat icon={DollarSign} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="purple" />
        </div>
        <div className="instructor-profile-content">
          <div className="instructor-profile-form">
            <h2>Basic Information</h2>
            <div className="profile-pic-row">
              <div className="profile-pic">
                {profileData.image ? (<img src={profileData.image} alt="profile" />) : (<User size={40} />)}
              </div>
              <label className="profile-upload-button">
                <p>
                  <Upload size={16} style={{ marginBottom: "-2px" }} />
                  Upload photo
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
function Stat({ icon, label, value, color }) {
  const Icon=icon;
  return (
    <div className={`instructor-stat-card ${color}`}>
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