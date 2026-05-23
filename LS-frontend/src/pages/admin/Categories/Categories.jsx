import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { createCategory, deleteCategory, getAdminCourses, getCategories } from "../../../services/courseApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import "./Categories.scss";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [categoryList, courseList] = await Promise.all([getCategories(), getAdminCourses()]);
      const safeCategories = Array.isArray(categoryList) ? categoryList : [];
      setCategories(safeCategories.filter((category) => category.active !== false));
      setCourses(Array.isArray(courseList) ? courseList : []);
      setError("");
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to load categories"));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryCoursesCount = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => {
      const key = String(course.categoryId || "");
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [courses]);

  const addCategory = async (event) => {
    event.preventDefault();
    try {
      await createCategory({
        name: form.name,
        description: form.description,
      });
      setShowAdd(false);
      setForm({ name: "", description: "" });
      await loadData();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to create category"));
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      await loadData();
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError, "Failed to delete category"));
    }
  };

  return (
    <div className="categories-layout">
      <div className="categories-page">
        {error && <p className="admin-error">{error}</p>}
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <button className="edit-btn delete" onClick={() => removeCategory(category)} title="Delete Category">
                <Trash2 size={16} />
              </button>

              <div className="icon">{String(category.name || "?").slice(0, 1).toUpperCase()}</div>
              <h3>{category.name}</h3>
              <p>{category.description || "No description"}</p>

              <div className="courses">
                <BookOpen size={16} />
                <span>{categoryCoursesCount.get(String(category.id)) || 0} Courses</span>
              </div>
            </div>
          ))}

          <button className="add-card" onClick={() => setShowAdd(true)}>
            <Plus size={28} />
            <span>Add Category</span>
          </button>
        </div>
      </div>
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Category</h3>

            <form onSubmit={addCategory}>
              <input
                placeholder="Category Name"
                value={form.name}
                required
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                required
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />

              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" className="cancel" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
