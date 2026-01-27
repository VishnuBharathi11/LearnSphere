import { Routes, Route } from 'react-router-dom';
import './App.css'; 
import Home from "./pages/Home/Home.jsx";
import About from './pages/About/About.jsx';
import Contact from './pages/Contact/Contact.jsx';
import Login from './auth-pages/Login/Login.jsx';
import Register from './auth-pages/Register/Register.jsx';
import ForgotPassword from './auth-pages/ForgotPassword/ForgotPassword.jsx'; 
import BrowseCourses from './pages/BrowseCourses/BrowseCourses.jsx';
import CourseDetail from './pages/CourseDetail/CourseDetail.jsx';
import LearnerDashboard from './Learner/Dashboard/Dashboard.jsx';
import LearnerMyCourses from './Learner/MyCourses/Mycourses.jsx';
import LearnerProgress from './Learner/Progress/Progress.jsx'
import Profile from './Learner/Profile/Profile.jsx';
import Assesment from './Learner/Assesment/Assesment.jsx';
function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/course/:id" element={<CourseDetail/>}/>
          <Route path="/learner-dashboard" element={ <LearnerDashboard/>} />
          <Route path="/learner-my-courses" element={ <LearnerMyCourses/>} />
          <Route path="/learner-progress" element={ <LearnerProgress/> } />
          <Route path="/learner-profile" element={<Profile/>} />
          <Route path="/learner-assesment" element={<Assesment/>} />
        </Routes>

        
    </>
  )
}

export default App;