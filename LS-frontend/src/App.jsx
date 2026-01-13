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
function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/browse-courses" element={<BrowseCourses />} />
        </Routes>
    </>
  )
}

export default App;