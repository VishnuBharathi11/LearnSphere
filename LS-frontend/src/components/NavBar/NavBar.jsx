import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo/logo.png'
import './NavBar.scss' 
import { useCurrentUser } from '../../hooks/useCurrentUser';
function NavBar() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const scrollToSection=(id)=>{
      const section=document.getElementById(id);
      if(section){
        section.scrollIntoView({behavior:'smooth'});
      }
    }

  const handleProfileClick = () => {
    const role = String(currentUser?.role || "").toLowerCase();
    if (role === "admin") {
      navigate("/admin-layout");
      return;
    }
    if (role === "instructor") {
      navigate("/instructor-layout/dashboard");
      return;
    }
    navigate("/student-layout/dashboard");
  };
  return (
    <>
    <nav className="navbar">
      <Link to="/" className="logo-section" aria-label="LearnSphere Home">
          <img src={logo} className="logo"/>
          <div className="logo-page-name">LearnSphere</div>
          </Link>
          <div className="nav-links">
          <Link to="/">Home</Link>
          <span onClick={()=>scrollToSection("about")}>About</span>
          <span onClick={()=>scrollToSection("contact")}>Contact</span>
          </div>
    
          <div className="nav-actions">
          {currentUser ? (
            <button type="button" className="profile-pill" onClick={handleProfileClick}>
              <span className="profile-name">{currentUser.name || "User"}</span>
              <span className="profile-email">{currentUser.email}</span>
            </button>
          ) : (
            <>
              <Link to="/login" className='btn-login'>Login</Link>
              <Link to="/register" className='btn-register'>Register</Link>
            </>
          )}
          </div>
          </nav>
          </>
  )
}

export default NavBar
