import { Navigate, Route, Routes } from "react-router-dom";
import "./App.scss";
import Home from "./pages/Public/Home/Home.jsx";
import About from "./pages/Public/About/About.jsx";
import Contact from "./pages/Public/Contact/Contact.jsx";
import GetStarted from "./pages/Public/GetStarted/GetStarted.jsx";
import BrowseCourses from "./pages/Public/BrowseCourses/BrowseCourses.jsx";
import CourseDetail from "./pages/Public/CourseDetail/CourseDetail.jsx";
import Instructors from "./pages/Public/Instructors/Instructors.jsx";
import InstructorApplication from "./pages/Public/InstructorApplication/InstructorApplication.jsx";
import Login from "./auth-pages/Login/Login.jsx";
import Register from "./auth-pages/Register/Register.jsx";
import ForgotPassword from "./auth-pages/ForgotPassword/ForgotPassword.jsx";
import PaymentPage from "./pages/Checkout/PaymentPage/PaymentPage.jsx";
import PaymentSuccess from "./pages/Checkout/PaymentSuccess/PaymentSuccess.jsx";
import StudentLayout from "./pages/Learner/StudentLayout/StudentLayout.jsx";
import StudentDashboard from "./pages/Learner/Dashboard/Dashboard.jsx";
import MyCourses from "./pages/Learner/MyCourses/Mycourses.jsx";
import Progress from "./pages/Learner/Progress/Progress.jsx";
import StudentProfile from "./pages/Learner/Profile/Profile.jsx";
import LearnCourse from "./pages/Learner/LearnCourse/LearnCourse.jsx";
import TestTaking from "./pages/Learner/TestTaking/TestTaking.jsx";
import AssesmentResult from "./pages/Learner/ResultPage/AssesmentResult.jsx";
import Certificates from "./pages/Learner/Certificates/Certificates.jsx";
import DownloadCertificate from "./pages/Learner/DownloadCertificate/DownloadCertificate.jsx";
import InstructorLayout from "./pages/instructor/InstructorLayout/InstructorLayout.jsx";
import InstructorDashboard from "./pages/instructor/Dashboard/Dashboard.jsx";
import CreateCourse from "./pages/instructor/CreateCourse/Createcourse.jsx";
import ManageCourses from "./pages/instructor/ManageCourse/Managecourse.jsx";
import UploadLesson from "./pages/instructor/ManageCourse/UpdateLesson/UpdateLesson.jsx";
import AddLesson from "./pages/instructor/ManageCourse/AddLesson/AddLesson.jsx";
import CreateQuiz from "./pages/instructor/ManageCourse/CreateQuiz/CreateQuiz.jsx";
import StudentProgress from "./pages/instructor/ManageCourse/StudentProgress/StudentProgress.jsx";
import CourseAnalytics from "./pages/instructor/ManageCourse/CourseAnalytics/CourseAnalytics.jsx";
import InstructorProfile from "./pages/instructor/Profile/InstructorProfile.jsx";
import ForumPage from "./forum/pages/ForumPage.jsx";
import TopicPage from "./forum/pages/TopicPage.jsx";
import ForumRoleLayout from "./forum/pages/ForumRoleLayout.jsx";
import AdminLayout from "./pages/admin/AdminLayout/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard.jsx";
import ManageUsers from "./pages/admin/ManageUsers/Manageusers.jsx";
import HandleCourses from "./pages/admin/HandleCourses/HandleCourses.jsx";
import ApproveCourses from "./pages/admin/ApproveCourses/Approvecourses.jsx";
import Categories from "./pages/admin/Categories/Categories.jsx";
import RoleManagement from "./pages/admin/RoleManagement/RoleManagement.jsx";
import Settings from "./pages/admin/Settings/Settings.jsx";
import InstructorApplications from "./pages/admin/InstructorApplications/InstructorApplications.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/instructors" element={<Instructors />} />
      <Route path="/instructor-application" element={<InstructorApplication />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/free-courses" element={<GetStarted />} />
      <Route path="/courses" element={<BrowseCourses />} />
      <Route path="/course/:id" element={<CourseDetail />} />

      <Route element={<ForumRoleLayout />}>
        <Route path="/courses/:courseId/forum" element={<ForumPage />} />
        <Route path="/forum/topic/:topicId" element={<TopicPage />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/buy/:id" element={<PaymentPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />

      <Route path="/student-layout" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="learn/:id" element={<LearnCourse />} />
        <Route path="test/:courseId" element={<TestTaking />} />
        <Route path="result" element={<AssesmentResult />} />
        <Route path="certificate" element={<Certificates />} />
        <Route path="download-certificate/:id" element={<DownloadCertificate />} />
      </Route>

      <Route path="/instructor-layout" element={<InstructorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="edit-course/:courseId" element={<CreateCourse />} />
        <Route path="manage-courses" element={<ManageCourses />} />
        <Route path="manage-courses/:courseId/lessons" element={<UploadLesson />} />
        <Route path="manage-courses/:courseId/lessons/new" element={<AddLesson />} />
        <Route path="manage-courses/:courseId/quiz" element={<CreateQuiz />} />
        <Route path="manage-courses/:courseId/students" element={<StudentProgress />} />
        <Route path="manage-courses/:courseId/analytics" element={<CourseAnalytics />} />
        <Route path="profile" element={<InstructorProfile />} />
      </Route>

      <Route path="/admin-layout" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="courses" element={<HandleCourses />} />
        <Route path="approve-courses" element={<ApproveCourses />} />
        <Route path="categories" element={<Categories />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="instructor-applications" element={<InstructorApplications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="forum" element={<ForumPage />} />
        <Route path="forum/topic/:topicId" element={<TopicPage />} />
      </Route>
    </Routes>
  );
}

export default App;
