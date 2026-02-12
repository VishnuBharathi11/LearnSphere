import { Routes, Route } from "react-router-dom";
import "./App.scss";

import Home from "./pages/Public/Home/Home.jsx";
import About from "./pages/Public/About/About.jsx";
import Contact from "./pages/Public/Contact/Contact.jsx";
import GetStarted from "./pages/Public/GetStarted/GetStarted.jsx";
import BrowseCourses from "./pages/Public/BrowseCourses/BrowseCourses.jsx";
import CourseDetail from "./pages/Public/CourseDetail/CourseDetail.jsx";
import Instructors from "./pages/Public/Instructors/Instructors.jsx";

import Login from "./auth-pages/Login/Login.jsx";
import Register from "./auth-pages/Register/Register.jsx";
import ForgotPassword from "./auth-pages/ForgotPassword/ForgotPassword.jsx";

import PaymentPage from "./pages/Checkout/PaymentPage/PaymentPage.jsx";
import PaymentSuccess from "./pages/Checkout/PaymentSuccess/PaymentSuccess.jsx";

import InstructorLayout from "./pages/instructor/InstructorLayout/InstructorLayout.jsx";

import InstructorDashboard from "./pages/instructor/Dashboard/Dashboard.jsx";
import CreateCourse from "./pages/instructor/CreateCourse/Createcourse.jsx";
import ManageCourses from "./pages/instructor/ManageCourse/Managecourse.jsx";
import UploadLesson from "./pages/instructor/ManageCourse/UpdateLesson/UpdateLesson.jsx";
import CreateQuiz from "./pages/instructor/ManageCourse/CreateQuiz/CreateQuiz.jsx";
import StudentProgress from "./pages/instructor/ManageCourse/StudentProgress/StudentProgress.jsx";
import CourseAnalytics from "./pages/instructor/ManageCourse/CourseAnalytics/CourseAnalytics.jsx";
import Discussion from "./pages/instructor/Discussion/Discussion.jsx";
import InstructorProfile from "./pages/instructor/Profile/InstructorProfile.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/instructors" element={<Instructors />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/free-courses" element={<GetStarted />} />
      <Route path="/courses" element={<BrowseCourses />} />
      <Route path="/course/:id" element={<CourseDetail />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/buy/:id" element={<PaymentPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />

      {/* INSTRUCTOR ROUTES */}
      <Route path="/instructor-layout" element={<InstructorLayout />}>

        <Route index element={<InstructorDashboard />} />
        <Route path="dashboard" element={<InstructorDashboard />} />

        <Route path="create-course" element={<CreateCourse />} />
        <Route path="edit-course/:courseId" element={<CreateCourse />} />

        <Route path="manage-courses" element={<ManageCourses />} />

        <Route path="manage-courses/:courseId/lessons" element={<UploadLesson />} />
        <Route path="manage-courses/:courseId/quiz" element={<CreateQuiz />} />
        <Route path="manage-courses/:courseId/students" element={<StudentProgress />} />
        <Route path="manage-courses/:courseId/analytics" element={<CourseAnalytics />} />

        <Route path="discussions" element={<Discussion />} />
        <Route path="profile" element={<InstructorProfile />} />

      </Route>
    </Routes>
  );
}

export default App;
