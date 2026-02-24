import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Createcourse.scss";
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
      return JSON.parse(window.appStore.getItem("currentUser"));
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
    if (!form.title.trim()) return "Course title is required";
    if (!form.description.trim()) return "Course description is required";
    if (!form.categoryId) return "Please choose a category";
    if (form.description.trim().length < 30) {
      return "Description should be at least 30 characters";
    }
    if (!form.thumbnail) return "Course thumbnail is required";
    if (Number(form.price) < 0) return "Invalid course price";
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
            placeholder="Write what students will learn, prerequisites and outcomes..."
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
            Categories are managed by admin. Contact admin if a category is missing.
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
