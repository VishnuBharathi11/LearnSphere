import React, { useRef, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import profileImage from "../../../assets/Learner/learner-profile.jpeg";
import "./Profile.scss";

function Profile() {
  const infoRef = useRef(null);
  const summaryRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Peter Parker",
    email: "peter@gmail.com",
    phone: "9876543210",
    bio: "Frontend developer passionate about learning.",
    image: "",
  });

  const [formData, setFormData] = useState(profile);

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);

    requestAnimationFrame(() => {
      infoRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);

    requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, image: imageURL }));
  };

  return (
      <div >
        <p className="profile-subtitle">
          Manage your personal information and preferences
        </p>

        <div className="profile-summary" ref={summaryRef}>
          <div className="summary-top">
            <div className="summary-left">
              <div className="profile-image-wrapper" onClick={handleImageClick}>
                <img src={profile.image || profileImage} alt="profile"/>
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
                <h3>{profile.name}</h3>
                <p>{profile.email}</p>
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
              <strong>8</strong>
            </div>
            <div>
              <span>Completed Courses</span>
              <strong>3</strong>
            </div>
            <div>
              <span>Certificates</span>
              <strong>2</strong>
            </div>
            <div>
              <span>Learning Hours</span>
              <strong>72</strong>
            </div>
          </div>
        </div>

        <div className="profile-bottom">
          <div className="personal-info" ref={infoRef}>
            <h3>Personal Information</h3>

            <label>Full Name</label>
            <input
              name="name"
              value={formData.name}
              disabled={!isEditing}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              disabled={!isEditing}
              onChange={handleChange}
            />

            <label>Phone Number</label>
            <input
              name="phone"
              value={formData.phone}
              disabled={!isEditing}
              onChange={handleChange}
            />

            <label>Bio</label>
            <textarea
              rows="4"
              name="bio"
              value={formData.bio}
              disabled={!isEditing}
              onChange={handleChange}
            />

            {isEditing && (
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            )}
          </div>

          <div className="achievements">
            <h3>Achievements</h3>

            <div className="achievement-card">
              🏆
              <div>
                <strong>Web Development Master</strong>
                <p>Completed Nov 26, 2024</p>
              </div>
            </div>

            <div className="achievement-card">
              🏆
              <div>
                <strong>React Native: Build Mobile Apps</strong>
                <p>Completed Nov 26, 2024</p>
              </div>
            </div>

            <div className="achievement-tip">
              🔥 You’re doing great!
              <p>Milestone reached—onward to the next goal!</p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Profile;
