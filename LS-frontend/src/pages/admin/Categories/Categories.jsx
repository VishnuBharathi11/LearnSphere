import { useState } from "react";
import { Plus, Edit, BookOpen } from "lucide-react";
import "./Categories.scss";

const Categories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Web Development",
      description: "HTML, CSS, JavaScript, React, etc.",
      icon: "💻",
      courses: 45
    },
    {
      id: 2,
      name: "Data Science",
      description: "Python, Statistics, Data Analysis",
      icon: "📊",
      courses: 32
    },
    {
      id: 3,
      name: "Mobile Development",
      description: "iOS, Android, Flutter",
      icon: "📱",
      courses: 28
    }
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "" });

  const openAdd = () => {
    setForm({ name: "", description: "", icon: "" });
    setShowAdd(true);
  };

  const openEdit = (cat) => {
    setActiveCategory(cat);
    setForm(cat);
    setShowEdit(true);
  };

  const addCategory = (e) => {
    e.preventDefault();
    setCategories([
      ...categories,
      { ...form, id: Date.now(), courses: 0 }
    ]);
    setShowAdd(false);
  };

  const updateCategory = (e) => {
    e.preventDefault();
    setCategories(
      categories.map(c =>
        c.id === activeCategory.id ? { ...c, ...form } : c
      )
    );
    setShowEdit(false);
  };

  return (
    <div className="admin-layout">

      <div className="categories-page">
        <div className="category-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card">
              <button className="edit-btn" onClick={() => openEdit(cat)}>
                <Edit size={16} />
              </button>

              <div className="icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>

              <div className="courses">
                <BookOpen size={16} />
                <span>{cat.courses} Courses</span>
              </div>
            </div>
          ))}

          <button className="add-card" onClick={openAdd}>
            <Plus size={28} />
            <span>Add Category</span>
          </button>
        </div>
      </div>
      {showAdd && (
        <Modal
          title="Add Category"
          form={form}
          setForm={setForm}
          onSubmit={addCategory}
          onClose={() => setShowAdd(false)}
        />
      )}
      {showEdit && (
        <Modal
          title="Edit Category"
          form={form}
          setForm={setForm}
          onSubmit={updateCategory}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
};

const Modal = ({ title, form, setForm, onSubmit, onClose }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h3>{title}</h3>

      <form onSubmit={onSubmit}>
        <input
          placeholder="Category Name"
          value={form.name}
          required
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          required
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Emoji Icon"
          value={form.icon}
          onChange={e => setForm({ ...form, icon: e.target.value })}
        />

        <div className="modal-actions">
          <button type="submit">Save</button>
          <button type="button" className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default Categories;
