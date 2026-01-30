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
import LearnCourse from './pages/Learner/LearnCourse/LearnCourse.jsx';

import InstructorDashboard from './pages/instructor/Dashboard/Dashboard.jsx';
import CreateCourse from './pages/instructor/CreateCourse/Createcourse.jsx';
import ManageCourses from './pages/instructor/ManageCourse/Managecourse.jsx';
import UploadLesson from './pages/instructor/ManageCourse/UpdateLesson/UpdateLesson.jsx';
import StudentLayout from './pages/Learner/StudentLayout/StudentLayout.jsx';
import CreateQuiz from './pages/instructor/ManageCourse/CreateQuiz/CreateQuiz.jsx';
import StudentProgress from './pages/instructor/ManageCourse/StudentProgress/StudentProgress.jsx';
import CourseAnalytics from './pages/instructor/ManageCourse/CourseAnalytics/CourseAnalytics.jsx';
import Discussion from './pages/instructor/Discussion/Discussion.jsx';
import InstructorProfile from './pages/instructor/Profile/InstructorProfile.jsx';

import AdminDashboard from './pages/admin/Dashboard/AdminDashboard.jsx';
import TestTaking from './pages/Learner/TestTaking/TestTaking.jsx';
import MyCourses from './pages/Learner/MyCourses/Mycourses.jsx';
// import AssessmentResult from './pages/Learner/ResultPage/ResultPage.jsx';

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
          {/* <Route path="/assessment-result" element={<AssessmentResult/>}/> */}
          <Route path="/learner-my-courses" element={ <MyCourses/>} />
          <Route path="/student-layout" element={ <StudentLayout/>} />
          <Route path="/learn/:id" element={<LearnCourse/>}/>
          <Route path="/take-test" element={<TestTaking />} />

          <Route path="/instructor" element={<InstructorDashboard/>} />
          <Route path="/create-course" element={<CreateCourse/>} />
          <Route path="/manage-courses" element={<ManageCourses/>} />
          <Route path="/manage-courses/:courseId" element={<UploadLesson/>}/>
          <Route path="/create-quiz/:courseId" element={<CreateQuiz/>}/>
          <Route path="/student-progress/:courseId" element={<StudentProgress/>}/>
          <Route path="/course-analytics/:courseId" element={<CourseAnalytics/>}/>
          <Route path="/discussions" element={<Discussion/>}/>
          <Route path="/profile" element={<InstructorProfile/>}/>

          <Route path="admin" element={<AdminDashboard/>}/>

        </Routes>        
    </>
  )
}

export default App;