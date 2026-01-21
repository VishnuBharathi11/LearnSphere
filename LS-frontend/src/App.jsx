import { Routes, Route } from 'react-router-dom';
import './App.css'; 
import Home from "./pages/Home/Home.jsx";
import About from './pages/About/About.jsx';
import Contact from './pages/Contact/Contact.jsx';
import Pricing from './pages/Pricing/Pricing.jsx';
import Login from './auth-pages/Login/Login.jsx';
import Register from './auth-pages/Register/Register.jsx';
import ForgotPassword from './auth-pages/ForgotPassword/ForgotPassword.jsx'; 
import BrowseCourses from './pages/BrowseCourses/BrowseCourses.jsx';
import LearnerDashboard from './pages/Learner/Dashboard/LearnerDashboard.jsx';
import LearnerAssesment from './pages/Learner/Assesment/LearnerAssesment.jsx';
import MyProfile from './pages/Learner/LearnerProfile/MyProfile.jsx';
import LearnerMyCourses from './pages/Learner/MyCourses/LearnerMyCourses.jsx';
import LearnerProgress from './pages/Learner/Progress/LearnerProgress.jsx';
function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/browse-courses" element={<BrowseCourses />} />
          <Route path="/learner-dashboard" element={ <LearnerDashboard/>} />
          <Route path="/learner-my-courses" element={ <LearnerMyCourses/>} />
          <Route path="/learner-progress" element={ <LearnerProgress/> } />
          <Route path="/learner-assesment" element={ <LearnerAssesment/>} />
          <Route path="/learner-my-profile" element={ <MyProfile/>} />
        </Routes>
    </>
  )
}

export default App;