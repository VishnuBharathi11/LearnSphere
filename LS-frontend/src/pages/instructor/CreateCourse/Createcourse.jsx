import React, { useState } from "react";
import { Sidebar, Upload, X } from "lucide-react";
import "./Createcourse.css";
import SidebarInstructor from "../../../components/SideBar-I/SidebarInstructor";

function Createcourse() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    level: "",
    language: "",
    duration: "",
    price: "",
    description: "",
    tags: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setThumbnail(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData, thumbnail);
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      category: "",
      level: "",
      language: "",
      duration: "",
      price: "",
      description: "",
      tags: "",
    });
    setThumbnail(null);
    setThumbnailPreview("");
  };

  return (
    <div className="create-course-layout">
        <SidebarInstructor/>
        <div className="create-course-page">
      <div className="create-header">
        <div>
          <h1>Create New Course</h1>
          <p>Fill in the details to create your course</p>
        </div>
        <button className="logout-btn">Logout</button>
      </div>

      <div className="form-card">
        <h2>Basic Information</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Complete Web Development Bootcamp"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option>Web Development</option>
                <option>Mobile Development</option>
                <option>Data Science</option>
                <option>Design</option>
                <option>Business</option>
              </select>
            </div>

            <div className="form-group">
              <label>Level *</label>
              <select name="level" value={formData.level} onChange={handleChange} required>
                <option value="">Select Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Language *</label>
              <select name="language" value={formData.language} onChange={handleChange} required>
                <option value="">Select Language</option>
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>

          <div className="form-grid two">
            <div className="form-group">
              <label>Duration (hours) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, JavaScript"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Course Thumbnail</label>

            {!thumbnailPreview ? (
              <div className="upload-box">
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  hidden
                  onChange={handleThumbnailChange}
                />
                <label htmlFor="thumbnail">
                  <Upload size={36} />
                  <p>Click to upload thumbnail</p>
                  <small>PNG / JPG (max 5MB)</small>
                </label>
              </div>
            ) : (
              <div className="thumbnail-preview">
                <img src={thumbnailPreview} alt="preview" />
                <button type="button" onClick={removeThumbnail}>
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              Create Course
            </button>
            <button type="button" className="secondary-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}

export default Createcourse;
