import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Createcourse.scss";

function CreateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditMode = Boolean(courseId);
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  };
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "instructor") {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  const getCourses = () => {
    try {
      return JSON.parse(localStorage.getItem("courses")) || [];
    } catch {
      return [];
    }
  };
  const getInitialForm = () => {
  try {
    const courses = JSON.parse(localStorage.getItem("courses")) || [];

    if (!isEditMode) {
      return {
        courseName: "",
        category: "",
        level: "",
        price: "",
        thumbnail: "",
      };
    }

    const existing = courses.find(
      (c) => String(c.id) === courseId && c.instructorId === currentUser?.id
    );

    if (!existing) {
      return {
        courseName: "",
        category: "",
        level: "",
        price: "",
        thumbnail: "",
      };
    }

    return {
      courseName: existing.courseName,
      category: existing.category,
      level: existing.level,
      price: existing.price,
      thumbnail: existing.thumbnail || "",
    };
  } catch {
    return {
      courseName: "",
      category: "",
      level: "",
      price: "",
      thumbnail: "",
    };
  }
};

const [form, setForm] = useState(getInitialForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        thumbnail: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };
  const validateForm = () => {
    if (!form.courseName.trim()) return "Course name required";
    if (!form.category.trim()) return "Category required";
    if (!form.level) return "Level required";
    if (Number(form.price) < 0) return "Invalid price";
    return null;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    const courses = getCourses();
    const duplicate=courses.find(
      (c)=>c.courseName.toLowerCase()===form.courseName.toLowerCase()&&c.instructorId===currentUser.id&&(!isEditMode||String(c.id)!==courseId)
    );
    if (duplicate) {
      alert("You already created a course with this name.");
      return;
    }
    if (isEditMode) {
      const updated = courses.map((course) =>
        String(course.id) === courseId
          ? {
              ...course,
              ...form,
              price: Number(form.price),
              updatedAt: new Date().toISOString(),
            }
          : course,
      );

      localStorage.setItem("courses", JSON.stringify(updated));
    } else {
      const newCourse = {
        id: Date.now(),
        courseName: form.courseName.trim(),
        category: form.category.trim(),
        level: form.level,
        price: Number(form.price),
        thumbnail: form.thumbnail,
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        rating: 0,
        students: 0,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("courses", JSON.stringify([...courses, newCourse]));
    }

    navigate("/instructor-layout/manage-courses");
  };

  return (
    <div className="create-course-layout">
      <div className="create-course-container">
        <h2>{isEditMode ? "Edit Course" : "Create Course"}</h2>
        <form onSubmit={handleSubmit}>
          <label>Course Name</label>
          <input
            name="courseName"
            value={form.courseName}
            onChange={handleChange}
            required
          />

          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <label>Level</label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label>Course Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
          />

          {form.thumbnail && (
            <img src={form.thumbnail} alt="Thumbnail preview" />
          )}

          <button type="submit" className="primary-btn">
            {isEditMode ? "Update Course" : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;
