import { Routes, Route } from 'react-router-dom';
import './App.css'; 

import Home from './pages/Public/Home/Home.jsx'
import About from './pages/Public/About/About.jsx'
import Contact from './pages/Public/Contact/Contact.jsx'
import BrowseCourses from './pages/Public/BrowseCourses/BrowseCourses.jsx';
import CourseDetail from './pages/Public/CourseDetail/CourseDetail.jsx';

import Login from './auth-pages/Login/Login.jsx'
import Register from './auth-pages/Register/Register.jsx'
import ForgotPassword from './auth-pages/ForgotPassword/ForgotPassword.jsx';

import PaymentPage from './pages/Checkout/PaymentPage/PaymentPage.jsx';
import PaymentSuccess from './pages/Checkout/PaymentSuccess/PaymentSuccess.jsx';

import LearnerDashboard from './pages/Learner/Dashboard/Dashboard.jsx'
import LearnerMyCourses from './pages/Learner/MyCourses/Mycourses.jsx';
import LearnerProgress from './pages/Learner/Progress/Progress.jsx'
import Profile from './pages/Learner/Profile/Profile.jsx';
import Assesment from './pages/Learner/Assesment/Assesment.jsx';
import LearnCourse from './pages/Learner/LearnCourse/LearnCourse.jsx';

import InstructorDashboard from './pages/instructor/Dashboard/Dashboard.jsx';
import CreateCourse from './pages/instructor/CreateCourse/Createcourse.jsx';
import ManageCourses from './pages/instructor/ManageCourse/Managecourse.jsx';
function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/course/:id" element={<CourseDetail/>}/>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/buy/:id" element={<PaymentPage/>}/>
          <Route path="/payment-success" element={<PaymentSuccess/>}/>

          <Route path="/learner-dashboard" element={ <LearnerDashboard/>} />
          <Route path="/learner-my-courses" element={ <LearnerMyCourses/>} />
          <Route path="/learner-progress" element={ <LearnerProgress/> } />
          <Route path="/learner-profile" element={<Profile/>} />
          <Route path="/learn/:id" element={<LearnCourse/>}/>
          <Route path="/learner-assesment" element={<Assesment/>} />

          <Route path="/instructor-dashboard" element={<InstructorDashboard/>} />
          <Route path="/instructor-create-course" element={<CreateCourse/>} />
          <Route path="/instructor-manage-courses" element={<ManageCourses/>} />

        </Routes>        
    </>
  )
}

export default App;