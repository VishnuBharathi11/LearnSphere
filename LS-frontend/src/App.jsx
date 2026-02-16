import { Routes, Route } from "react-router-dom";
import "./App.scss";
// Public pages
import Home from "./pages/Public/Home/Home.jsx";
import About from "./pages/Public/About/About.jsx";
import Contact from "./pages/Public/Contact/Contact.jsx";
import GetStarted from "./pages/Public/GetStarted/GetStarted.jsx";
import BrowseCourses from "./pages/Public/BrowseCourses/BrowseCourses.jsx";
import CourseDetail from "./pages/Public/CourseDetail/CourseDetail.jsx";
import Instructors from "./pages/Public/Instructors/Instructors.jsx";
// Auth Pages
import Login from "./auth-pages/Login/Login.jsx";
import Register from "./auth-pages/Register/Register.jsx";
import ForgotPassword from "./auth-pages/ForgotPassword/ForgotPassword.jsx";
// Payment Pages
import PaymentPage from "./pages/Checkout/PaymentPage/PaymentPage.jsx";
import PaymentSuccess from "./pages/Checkout/PaymentSuccess/PaymentSuccess.jsx";
// Learner Pages
import StudentLayout from "./pages/Learner/StudentLayout/StudentLayout.jsx";
import StudentDashboard from "./pages/Learner/Dashboard/Dashboard.jsx";
import MyCourses from "./pages/Learner/MyCourses/Mycourses.jsx";
import Progress from "./pages/Learner/Progress/Progress.jsx";
import Assessment from "./pages/Learner/Assesment/Assesment.jsx";
import StudentProfile from "./pages/Learner/Profile/Profile.jsx";
// Course Pages
import LearnCourse from "./pages/Learner/LearnCourse/LearnCourse.jsx";
import TestTaking from "./pages/Learner/TestTaking/TestTaking.jsx";
import Certificate from "./pages/Learner/Certificate/Certificate.jsx";
// Instructor Pages
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
// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard.jsx";
import ManageUsers from "./pages/admin/ManageUsers/ManageUsers.jsx";
import HandleCourses from "./pages/admin/HandleCourses/HandleCourses.jsx";
import ApproveCourses from "./pages/admin/ApproveCourses/ApproveCourses.jsx";
import Categories from "./pages/admin/Categories/Categories.jsx";
import RoleManagement from "./pages/admin/RoleManagement/RoleManagement.jsx";
import Settings from "./pages/admin/Settings/Settings.jsx";

function App() {
  return (
    <Routes>

      {/* -------- PUBLIC ROUTES -------- */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/instructors" element={<Instructors />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/free-courses" element={<GetStarted />} />
      <Route path="/courses" element={<BrowseCourses />} />
      <Route path="/course/:id" element={<CourseDetail />} />

      {/* -------- AUTH ROUTES -------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* -------- PAYMENT ROUTES -------- */}
      <Route path="/buy/:id" element={<PaymentPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />

      {/* -------- STUDENT ROUTES -------- */}
      <Route path="/student-layout" element={<StudentLayout />}>

        <Route index element={<StudentDashboard />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="progress" element={<Progress />} />
        <Route path="assessment" element={<Assessment />} />
        <Route path="profile" element={<StudentProfile />} />

        {/*----LEARN COURSE PAGE----- */}
        <Route path="learn/:id" element={<LearnCourse />} />

        {/*-----TEST TAKING PAGE------*/}
        <Route path="test/:courseId" element={<TestTaking />} />

        {/*------CERTIFICATE PAGE-----*/}
        <Route path="certificate/:id" element={<Certificate />} />

      </Route>

      {/* -------- INSTRUCTOR ROUTES -------- */}
      <Route path="/instructor-layout" element={<InstructorLayout />}>

        <Route index element={<InstructorDashboard />} />
        <Route path="dashboard" element={<InstructorDashboard />} />

        <Route path="create-course" element={<CreateCourse />} />
        <Route path="edit-course/:courseId" element={<CreateCourse />} />

        <Route path="manage-courses" element={<ManageCourses />} />

        <Route path="manage-courses/:courseId/lessons" element={<UploadLesson />}/>
        <Route path="manage-courses/:courseId/quiz" element={<CreateQuiz />}/>
        <Route path="manage-courses/:courseId/students" element={<StudentProgress />}/>
        <Route path="manage-courses/:courseId/analytics" element={<CourseAnalytics />}/>

        <Route path="discussions" element={<Discussion />} />
        <Route path="profile" element={<InstructorProfile />} />

      </Route>

      {/* -------- ADMIN ROUTES -------- */}
      <Route path="/admin-layout" element={<AdminLayout />}>

        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="courses" element={<HandleCourses />} />
        <Route path="approve-courses" element={<ApproveCourses />} />
        <Route path="categories" element={<Categories />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="settings" element={<Settings />} />

      </Route>

    </Routes>
  );
}

export default App;
