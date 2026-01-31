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

import StudentLayout from "./pages/Learner/StudentLayout/StudentLayout.jsx";
import LearnerDashboard from "./pages/Learner/Dashboard/Dashboard.jsx";
import LearnerMyCourses from "./pages/Learner/MyCourses/Mycourses.jsx";
import LearnerProgress from "./pages/Learner/Progress/Progress.jsx";
import Profile from "./pages/Learner/Profile/Profile.jsx";
import Assesment from "./pages/Learner/Assesment/Assesment.jsx";
import TestTaking from "./pages/Learner/TestTaking/TestTaking.jsx";
import LearnCourse from "./pages/Learner/LearnCourse/LearnCourse.jsx";
import Certificate from "./pages/Learner/Certificate/Certificate.jsx";

import InstructorDashboard from "./pages/instructor/Dashboard/Dashboard.jsx";
import CreateCourse from "./pages/instructor/CreateCourse/Createcourse.jsx";
import ManageCourses from "./pages/instructor/ManageCourse/Managecourse.jsx";
import UploadLesson from "./pages/instructor/ManageCourse/UpdateLesson/UpdateLesson.jsx";
import CreateQuiz from "./pages/instructor/ManageCourse/CreateQuiz/CreateQuiz.jsx";
import StudentProgress from "./pages/instructor/ManageCourse/StudentProgress/StudentProgress.jsx";
import CourseAnalytics from "./pages/instructor/ManageCourse/CourseAnalytics/CourseAnalytics.jsx";
import Discussion from "./pages/instructor/Discussion/Discussion.jsx";
import InstructorProfile from "./pages/instructor/Profile/InstructorProfile.jsx";

import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard.jsx";
import Manageusers from "./pages/admin/ManageUsers/Manageusers.jsx";
import HandleCourses from "./pages/admin/HandleCourses/HandleCourses.jsx";
import Approvecourses from "./pages/admin/ApproveCourses/Approvecourses.jsx";
import ReviewCourse from "./pages/admin/ApproveCourses/ReviewCourse/ReviewCourse.jsx";
import Categories from "./pages/admin/Categories/Categories.jsx";
import RoleManagement from "./pages/admin/RoleManagement/RoleManagement.jsx";
import Settings from "./pages/admin/Settings/Settings.jsx";

function App() {
  return (
    <>
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

        <Route path="/student-layout" element={<StudentLayout />}>
          <Route index element={<LearnerDashboard />} />
          <Route path="dashboard" element={<LearnerDashboard />} />
          <Route path="my-courses" element={<LearnerMyCourses />} />
          <Route path="progress" element={<LearnerProgress />} />
          <Route path="assessment" element={<Assesment />} />
          <Route path="test/:" element={<TestTaking />} />
          <Route path="profile" element={<Profile />} />
          <Route path="learn/:id" element={<LearnCourse />} />
          <Route path="certificate/:id" element={<Certificate />} />
        </Route>
        <Route path="/dashboard" element={<InstructorDashboard />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/edit-course/:courseId" element={<CreateCourse />} />
        <Route path="manage-courses" element={<ManageCourses />} />
        <Route
          path="manage-courses/:courseId/lessons"
          element={<UploadLesson />}
        />
        <Route path="manage-courses/:courseId/quiz" element={<CreateQuiz />} />
        <Route
          path="manage-courses/:courseId/students"
          element={<StudentProgress />}
        />
        <Route
          path="manage-courses/:courseId/analytics"
          element={<CourseAnalytics />}
        />
        <Route path="/discussions" element={<Discussion />} />
        <Route path="/profile" element={<InstructorProfile />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manage-users" element={<Manageusers />} />
        <Route path="/handle-courses" element={<HandleCourses />} />
        <Route path="/approve-courses" element={<Approvecourses />} />
        <Route
          path="/approve-courses/:courseId/review"
          element={<ReviewCourse />}
        />
        <Route path="/categories" element={<Categories />} />
        <Route path="/roles" element={<RoleManagement />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
