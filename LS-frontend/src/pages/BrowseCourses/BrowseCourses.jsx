import React,{useState} from 'react'
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import courses from './browsescourses'
import "./BrowseCourses.css"
function BrowseCourses() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");

  const filteredCourses = courses.filter(course => {
    return (
      course.courseName.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || course.category === category) &&
      (level === "" || course.level === level) &&
      (price === "" || course.price <= Number(price)) &&
      (rating === "" || course.rating >= Number(rating))
    );
  });
  return (
    <>
   <NavBar/>
   <div className="browse-container">
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search for courses"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select onChange={e => setCategory(e.target.value)}>
          <option value="">Category</option>
          <option value="Web Development">Web Development</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="Data Science">Data Science</option>
        </select>

        <select onChange={e => setLevel(e.target.value)}>
          <option value="">Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select onChange={e => setPrice(e.target.value)}>
          <option value="">Price</option>
          <option value="500">Below ₹500</option>
          <option value="700">Below ₹700</option>
          <option value="1000">Below ₹1000</option>
        </select>

        <select onChange={e => setRating(e.target.value)}>
          <option value="">Rating</option>
           <option value="3.5">3.5★ & above</option>
          <option value="4">4★ & above</option>
          <option value="4.5">4.5★ & above</option>
        </select>
      </div>

      <div className="course-container">
        {filteredCourses.map(course => (
          <div className="course" key={course.id}>
            <img src={course.image} alt={course.courseName} className=""/>
            <div className="course-name">{course.courseName}</div>
            <div className="course-instr-name">{course.instructor}</div>
            <div className="course-rating">⭐ {course.rating}</div>
            <div className="course-cat-lvl-cont">
            <div className="course-cat">{course.category}</div>
              <div className="course-lvl">{course.level}</div>
              </div>
            <div className="course-price">₹{course.price}</div>
          </div>
        ))}
      </div>
    </div>
   <Footer/>
    </>
  )
}

export default BrowseCourses