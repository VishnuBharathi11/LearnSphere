import React from 'react'
import { Link } from 'react-router-dom';
import logo from '../../assets/Logo/logo.png'
import './NavBar.scss' 
function NavBar() {
  const scrollToSection=(id)=>{
      const section=document.getElementById(id);
      if(section){
        section.scrollIntoView({behavior:'smooth'});
      }
    }
  return (
    <>
    <nav className="navbar">
      <div className="logo-section">
          <img src={logo} className="logo"/>
          <div className="n-page-name">LearnSphere</div>
          </div>
          <div className="nav-links">
          <Link to="/">Home</Link>
          <span onClick={()=>scrollToSection("about")}>About</span>
          <span onClick={()=>scrollToSection("contact")}>Contact</span>
          </div>
    
          <div className="nav-actions">
          <Link to="/login" className='btn-login'>Login</Link>
          <Link to="/register" className='btn-register'>Register</Link>
          </div>
          </nav>
          </>
  )
}

export default NavBar