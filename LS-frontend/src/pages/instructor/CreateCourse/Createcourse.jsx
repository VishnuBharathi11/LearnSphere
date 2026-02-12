import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Createcourse.scss";
import "../../../components/SideBar-I/SidebarInstructor"
import SidebarInstructor from "../../../components/SideBar-I/SidebarInstructor";

function CreateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditMode = Boolean(courseId);
  const instructor = {
    id: 10,
    name: "John Instructor",
  };
  const [form, setForm] = useState(() => {
    if (!courseId) {
      return {
        courseName: "",
        category: "",
        level: "",
        price: "",
        lessons: "",
        thumbnail: "",
      };
    }
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    const existingCourse = courses.find((c) => String(c.id) === courseId);
    return existingCourse
      ? {
          courseName: existingCourse.courseName,
          category: existingCourse.category,
          level: existingCourse.level,
          price: existingCourse.price,
          lessons: existingCourse.lessons,
          thumbnail: existingCourse.thumbnail || "",
        }
      : {
          courseName: "",
          category: "",
          level: "",
          price: "",
          lessons: "",
          thumbnail: "",
        };
  });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        thumbnail: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const courses = JSON.parse(localStorage.getItem("courses")) || [];
    if (isEditMode) {
      const updated = courses.map((course) =>
        String(course.id) === courseId
          ? {
              ...course,
              ...form,
              price: Number(form.price),
              lessons: Number(form.lessons),
            }
          : course,
      );

      localStorage.setItem("courses", JSON.stringify(updated));
    } else {
      const newCourse = {
        id: Date.now(),
        courseName: form.courseName,
        category: form.category,
        level: form.level,
        price: Number(form.price),
        lessons: Number(form.lessons),
        thumbnail: form.thumbnail,
        instructorId: instructor.id,
        instructorName: instructor.name,
        rating: 0,
        students: 0,
        status: "draft",
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("courses", JSON.stringify([...courses, newCourse]));
    }

    navigate("/instructor/manage-courses");
  };

  return (
    <div className="create-course-layout">
      <div className="create-course-container">
      <h2>{isEditMode ? "Edit Course" : "Create New Course"}</h2>

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

        <label>Total Lessons</label>
        <input
          type="number"
          name="lessons"
          value={form.lessons}
          onChange={handleChange}
          required
        />

        <label>Course Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailUpload} />

        {form.thumbnail && <img src={form.thumbnail} alt="Thumbnail preview" />}

        <button type="submit" className="primary-btn">
          {isEditMode ? "Update Course" : "Create Course"}
        </button>
      </form>
    </div>
    </div>
  );
}

export default CreateCourse;
