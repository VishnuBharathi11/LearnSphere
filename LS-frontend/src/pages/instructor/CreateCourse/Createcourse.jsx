import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Createcourse.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";
import {
  createCourse,
  getCategories,
  getCourseById,
  submitCourseForReview,
  updateCourse,
} from "../../../services/courseApi";
function CreateCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditMode = Boolean(courseId);
  const currentUser = useMemo(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  }, []);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    thumbnail: "",
  });
  useEffect(() => {
    const role = String(currentUser?.role || "").toLowerCase();
    if (!currentUser || role !== "instructor") {
      navigate("/login", { replace: true });
      return;
    }
    let active = true;
    getCategories()
      .then((data) => {
        if (!active) return;
        setCategories(data.filter((c) => c.active !== false));
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load categories");
      })
      .finally(() => {
        if (!active) return;
        setLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser, navigate]);
  useEffect(() => {
    if (!isEditMode || !currentUser?.id) return;
    let active = true;
    async function loadCourse() {
      try {
        const existing = await getCourseById(courseId);
        if (!active) return;
        if (String(existing?.instructorId) !== String(currentUser.id)) {
          setError("You are not allowed to edit this course");
          return;
        }
        setForm({
          title: existing?.title || "",
          description: existing?.description || "",
          price: String(existing?.price ?? ""),
          categoryId: existing?.categoryId || "",
          thumbnail: existing?.thumbnail || "",
        });
      } catch {
        if (!active) return;
        setError("Failed to load course details");
      }
    }
    loadCourse();
    return () => {
      active = false;
    };
  }, [isEditMode, courseId, currentUser?.id]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, thumbnail: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };
  const validateForm = () => {
    if (!form.title.trim()) return "Please enter a course title.";
    if (!form.description.trim()) return "Please enter a course description.";
    if (!form.categoryId) return "Please select a course category.";
    if (form.description.trim().length < 30) {
      return "Course description must be at least 30 characters long to provide sufficient detail for students.";
    }
    if (!form.thumbnail) return "Please upload a course thumbnail image.";
    if (Number(form.price) < 0) return "Course price cannot be negative. Please enter a valid price.";
    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        await updateCourse(courseId, {
          title: form.title.trim(),
          description: form.description.trim(),
          thumbnail: form.thumbnail,
          price: Number(form.price || 0),
          categoryId: form.categoryId,
          instructorId: currentUser.id,
        });
      } else {
        const created = await createCourse({
          title: form.title.trim(),
          description: form.description.trim(),
          thumbnail: form.thumbnail,
          price: Number(form.price || 0),
          categoryId: form.categoryId,
          instructorId: currentUser.id,
        });
        await submitCourseForReview(created.id);
      }
      navigate("/instructor-layout/manage-courses", { replace: true });
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        apiError?.message ||
        "Failed to create course";
      setError(message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="create-course-layout">
      <div className="create-course-container">
        {error && <p className="cc-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Course Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: React Fundamentals Bootcamp"
            required
          />
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what students will learn, any requirements, and the key learning outcomes."
            rows={5}
            required
          />
          <label>Category</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            disabled={loadingCategories}
          >
            <option value="">Select existing category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <small className="cc-helper">
            Course categories are managed by the administration. If you need a new category, please contact support.
          </small>
          <label>Price (INR)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min="0"
            step="1"
            required
          />
          <label>Course Thumbnail</label>
          <input type="file" accept="image/*" onChange={handleThumbnailUpload} />
          {form.thumbnail && (
            <img
              className="cc-thumbnail-preview"
              src={form.thumbnail}
              alt="Course thumbnail preview"
            />
          )}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : isEditMode ? "Update Course" : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default CreateCourse;